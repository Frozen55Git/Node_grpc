/*
 * Copyright 2022 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { CallCredentials } from "./call-credentials";
import { Call, InterceptingListener, MessageContext, StatusObject } from "./call-interface";
import { SubchannelCall } from "./subchannel-call";
import { ConnectivityState } from "./connectivity-state";
import { LogVerbosity, Status } from "./constants";
import { Deadline, getDeadlineTimeoutString } from "./deadline";
import { FilterStack, FilterStackFactory } from "./filter-stack";
import { InternalChannel } from "./internal-channel";
import { Metadata } from "./metadata";
import { PickResultType } from "./picker";
import { CallConfig } from "./resolver";
import { splitHostPort } from "./uri-parser";
import * as logging from './logging';

const TRACER_NAME = 'load_balancing_call';

export type RpcProgress = 'NOT_STARTED' | 'DROP' | 'REFUSED' | 'PROCESSED';

export interface StatusObjectWithProgress extends StatusObject {
  progress: RpcProgress;
}

export class LoadBalancingCall implements Call {
  private child: SubchannelCall | null = null;
  private readPending = false;
  private writeFilterPending = false;
  private pendingMessage: {context: MessageContext, message: Buffer} | null = null;
  private pendingHalfClose = false;
  private ended = false;
  private serviceUrl: string;
  private filterStack: FilterStack;
  private metadata: Metadata | null = null;
  private listener: InterceptingListener | null = null;
  private onCallEnded: ((statusCode: Status) => void) | null = null;
  constructor(
    private readonly channel: InternalChannel,
    private readonly callConfig: CallConfig,
    private readonly methodName: string,
    private readonly host : string,
    private readonly credentials: CallCredentials,
    private readonly deadline: Deadline,
    filterStackFactory: FilterStackFactory,
    private readonly callNumber: number
  ) {
    this.filterStack = filterStackFactory.createFilter();

    const splitPath: string[] = this.methodName.split('/');
    let serviceName = '';
    /* The standard path format is "/{serviceName}/{methodName}", so if we split
     * by '/', the first item should be empty and the second should be the
     * service name */
    if (splitPath.length >= 2) {
      serviceName = splitPath[1];
    }
    const hostname = splitHostPort(this.host)?.host ?? 'localhost';
    /* Currently, call credentials are only allowed on HTTPS connections, so we
     * can assume that the scheme is "https" */
    this.serviceUrl = `https://${hostname}/${serviceName}`;
  }

  private trace(text: string): void {
    logging.trace(
      LogVerbosity.DEBUG,
      TRACER_NAME,
      '[' + this.callNumber + '] ' + text
    );
  }

  private outputStatus(status: StatusObject, progress: RpcProgress) {
    if (!this.ended) {
      this.ended = true;
      this.trace('ended with status: code=' + status.code + ' details="' + status.details + '"');
      const filteredStatus = this.filterStack.receiveTrailers(status);
      const finalStatus = {...filteredStatus, progress};
      this.listener?.onReceiveStatus(finalStatus);
      this.onCallEnded?.(finalStatus.code);
    }
  }

  doPick() {
    if (this.ended) {
      return;
    }
    if (!this.metadata) {
      throw new Error('doPick called before start');
    }
    const pickResult = this.channel.doPick(this.metadata, this.callConfig.pickInformation);
    const subchannelString = pickResult.subchannel ? 
      '(' + pickResult.subchannel.getChannelzRef().id + ') ' + pickResult.subchannel.getAddress() : 
      '' + pickResult.subchannel; 
    this.trace(
      'Pick result: ' +
        PickResultType[pickResult.pickResultType] +
        ' subchannel: ' +
        subchannelString +
        ' status: ' +
        pickResult.status?.code +
        ' ' +
        pickResult.status?.details
    );
    switch (pickResult.pickResultType) {
      case PickResultType.COMPLETE:
        this.credentials.generateMetadata({service_url: this.serviceUrl}).then(
          (credsMetadata) => {
            const finalMetadata = this.metadata!.clone();
            finalMetadata.merge(credsMetadata);
            if (finalMetadata.get('authorization').length > 1) {
              this.outputStatus(
                {
                  code: Status.INTERNAL,
                  details: '"authorization" metadata cannot have multiple values',
                  metadata: new Metadata()
                },
                'PROCESSED'
              );
            }
            if (pickResult.subchannel!.getConnectivityState() !== ConnectivityState.READY) {
              this.trace(
                'Picked subchannel ' +
                  subchannelString +
                  ' has state ' +
                  ConnectivityState[pickResult.subchannel!.getConnectivityState()] +
                  ' after getting credentials metadata. Retrying pick'
              );
              this.doPick();
              return;
            }

            if (this.deadline !== Infinity) {
              finalMetadata.set('grpc-timeout', getDeadlineTimeoutString(this.deadline));
            }
            try {
              this.child = pickResult.subchannel!.getRealSubchannel().createCall(finalMetadata, this.host, this.methodName, {
                onReceiveMetadata: metadata => {
                  this.listener!.onReceiveMetadata(this.filterStack.receiveMetadata(metadata));
                },
                onReceiveMessage: message => {
                  this.filterStack.receiveMessage(message).then(filteredMesssage => {
                    this.listener!.onReceiveMessage(filteredMesssage);
                  }, (status: StatusObject) => {
                    this.cancelWithStatus(status.code, status.details);
                  });
                },
                onReceiveStatus: status => {
                  this.outputStatus(status, 'PROCESSED');
                }
              });
            } catch (error) {
              this.trace(
                'Failed to start call on picked subchannel ' +
                  subchannelString +
                  ' with error ' +
                  (error as Error).message
              );
              this.outputStatus(
                {
                  code: Status.INTERNAL,
                  details: 'Failed to start HTTP/2 stream with error ' + (error as Error).message,
                  metadata: new Metadata()
                },
                'NOT_STARTED'
              );
              return;
            }
            this.callConfig.onCommitted?.();
            pickResult.onCallStarted?.();
            this.onCallEnded = pickResult.onCallEnded;
            this.trace('Created child call [' + this.child.getCallNumber() + ']');
            if (this.readPending) {
              this.child.startRead();
            }
            if (this.pendingMessage) {
              this.child.sendMessageWithContext(this.pendingMessage.context, this.pendingMessage.message);
            }
            if (this.pendingHalfClose && !this.writeFilterPending) {
              this.child.halfClose();
            }
          }, (error: Error & { code: number }) => {
            // We assume the error code isn't 0 (Status.OK)
            this.outputStatus(
              {
                code: typeof error.code === 'number' ? error.code : Status.UNKNOWN,
                details: `Getting metadata from plugin failed with error: ${error.message}`,
                metadata: new Metadata()
              },
              'PROCESSED'
            );
          }
        );
        break;
      case PickResultType.DROP:
        this.outputStatus(pickResult.status!, 'DROP');
        break;
      case PickResultType.TRANSIENT_FAILURE:
        if (this.metadata.getOptions().waitForReady) {
          this.channel.queueCallForPick(this);
        } else {
          this.outputStatus(pickResult.status!, 'PROCESSED');
        }
        break;
      case PickResultType.QUEUE:
        this.channel.queueCallForPick(this);
    }
  }

  cancelWithStatus(status: Status, details: string): void {
    this.trace('cancelWithStatus code: ' + status + ' details: "' + details + '"');
    this.child?.cancelWithStatus(status, details);
    this.outputStatus({code: status, details: details, metadata: new Metadata()}, 'PROCESSED');
  }
  getPeer(): string {
    return this.child?.getPeer() ?? this.channel.getTarget();
  }
  start(metadata: Metadata, listener: InterceptingListener): void {
    this.trace('start called');
    this.listener = listener;
    this.filterStack.sendMetadata(Promise.resolve(metadata)).then(filteredMetadata => {
      this.metadata = filteredMetadata;
      this.doPick();
    }, (status: StatusObject) => {
      this.outputStatus(status, 'PROCESSED');
    });
  }
  sendMessageWithContext(context: MessageContext, message: Buffer): void {
    this.trace('write() called with message of length ' + message.length);
    this.writeFilterPending = true;
    this.filterStack.sendMessage(Promise.resolve({message: message, flags: context.flags})).then((filteredMessage) => {
      this.writeFilterPending = false;
      if (this.child) {
        this.child.sendMessageWithContext(context, filteredMessage.message);
        if (this.pendingHalfClose) {
          this.child.halfClose();
        }
      } else {
        this.pendingMessage = {context, message: filteredMessage.message};
      }
    }, (status: StatusObject) => {
      this.cancelWithStatus(status.code, status.details);
    })
  }
  startRead(): void {
    this.trace('startRead called');
    if (this.child) {
      this.child.startRead();
    } else {
      this.readPending = true;
    }
  }
  halfClose(): void {
    this.trace('halfClose called');
    if (this.child && !this.writeFilterPending) {
      this.child.halfClose();
    } else {
      this.pendingHalfClose = true;
    }
  }
  setCredentials(credentials: CallCredentials): void {
    throw new Error("Method not implemented.");
  }

  getCallNumber(): number {
    return this.callNumber;
  }
}