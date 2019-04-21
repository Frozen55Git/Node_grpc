/*
 * Copyright 2019 gRPC authors.
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

import {EventEmitter} from 'events';
import * as http2 from 'http2';
import {Duplex, Readable, Writable} from 'stream';

import {ServiceError} from './call';
import {Status} from './constants';
import {Deserialize, Serialize} from './make-client';
import {Metadata} from './metadata';

function noop(): void {}

export type PartialServiceError = Partial<ServiceError>;

type DeadlineUnitIndexSignature = {
  [name: string]: number
};

const GRPC_ACCEPT_ENCODING_HEADER = 'grpc-accept-encoding';
const GRPC_ENCODING_HEADER = 'grpc-encoding';
const GRPC_MESSAGE_HEADER = 'grpc-message';
const GRPC_STATUS_HEADER = 'grpc-status';
const GRPC_TIMEOUT_HEADER = 'grpc-timeout';
const DEADLINE_REGEX = /(\d{1,8})\s*([HMSmun])/;
const deadlineUnitsToMs: DeadlineUnitIndexSignature = {
  H: 3600000,
  M: 60000,
  S: 1000,
  m: 1,
  u: 0.001,
  n: 0.000001
};
const defaultResponseHeaders = {
  // TODO(cjihrig): Remove these encoding headers from the default response
  // once compression is integrated.
  [GRPC_ACCEPT_ENCODING_HEADER]: 'identity',
  [GRPC_ENCODING_HEADER]: 'identity',
  [http2.constants.HTTP2_HEADER_STATUS]: http2.constants.HTTP_STATUS_OK,
  [http2.constants.HTTP2_HEADER_CONTENT_TYPE]: 'application/grpc+proto'
};
const defaultResponseOptions = {
  waitForTrailers: true
} as http2.ServerStreamResponseOptions;


export type ServerSurfaceCall = {
  cancelled: boolean; getPeer(): string;
  sendMetadata(responseMetadata: Metadata): void
};

export type ServerUnaryCall<RequestType, ResponseType> =
    ServerSurfaceCall&{request: RequestType | null};
export type ServerReadableStream<RequestType, ResponseType> =
    ServerSurfaceCall&Readable;
export type ServerWritableStream<RequestType, ResponseType> =
    ServerSurfaceCall&Writable&{request: RequestType | null};
export type ServerDuplexStream<RequestType, ResponseType> =
    ServerSurfaceCall&Duplex;

export class ServerUnaryCallImpl<RequestType, ResponseType> extends EventEmitter
    implements ServerUnaryCall<RequestType, ResponseType> {
  cancelled: boolean;
  request: RequestType|null;

  constructor(
      private call: Http2ServerCallStream<RequestType, ResponseType>,
      public metadata: Metadata) {
    super();
    this.cancelled = false;
    this.request = null;
  }

  getPeer(): string {
    throw new Error('not implemented yet');
  }

  sendMetadata(responseMetadata: Metadata): void {
    this.call.sendMetadata(responseMetadata);
  }
}


export class ServerReadableStreamImpl<RequestType, ResponseType> extends
    Readable implements ServerReadableStream<RequestType, ResponseType> {
  cancelled: boolean;
  private done = false;

  constructor(
      private call: Http2ServerCallStream<RequestType, ResponseType>,
      public metadata: Metadata,
      private _deserialize: Deserialize<RequestType>) {
    super();
    this.cancelled = false;
  }

  getPeer(): string {
    throw new Error('not implemented yet');
  }

  sendMetadata(responseMetadata: Metadata): void {
    this.call.sendMetadata(responseMetadata);
  }

  _done(): void {
    this.done = true;
    this.on('data', noop);
  }
}


export class ServerWritableStreamImpl<RequestType, ResponseType> extends
    Writable implements ServerWritableStream<RequestType, ResponseType> {
  cancelled: boolean;
  request: RequestType|null;

  constructor(
      private call: Http2ServerCallStream<RequestType, ResponseType>,
      public metadata: Metadata, private _serialize: Serialize<ResponseType>) {
    super({objectMode: true});
    this.cancelled = false;
    this.request = null;

    this.on('error', (err) => {
      this.call.sendError(err as ServiceError);
      this.end();
    });
  }

  getPeer(): string {
    throw new Error('not implemented yet');
  }

  sendMetadata(responseMetadata: Metadata): void {
    this.call.sendMetadata(responseMetadata);
  }

  async _write(chunk: ResponseType, encoding: string, callback: Function) {
    try {
      const response = await this.call.serializeMessage(chunk);
      this.call.write(response);
    } catch (err) {
      err.code = Status.INTERNAL;
      this.emit('error', err);
    }

    callback(null);
  }

  _final(callback: Function): void {
    this.call.end();
    callback(null);
  }

  // tslint:disable-next-line:no-any
  end(metadata?: any) {
    if (metadata) {
      this.call.status.metadata = metadata;
    }

    super.end();
  }

  serialize(input: ResponseType): Buffer|null {
    if (input === null || input === undefined) {
      return null;
    }

    return this._serialize(input);
  }
}


export class ServerDuplexStreamImpl<RequestType, ResponseType> extends Duplex
    implements ServerDuplexStream<RequestType, ResponseType> {
  cancelled: boolean;

  constructor(
      private call: Http2ServerCallStream<RequestType, ResponseType>,
      public metadata: Metadata, private _serialize: Serialize<ResponseType>,
      private _deserialize: Deserialize<RequestType>) {
    super();
    this.cancelled = false;
  }

  getPeer(): string {
    throw new Error('not implemented yet');
  }

  sendMetadata(responseMetadata: Metadata): void {
    this.call.sendMetadata(responseMetadata);
  }
}


// Unary response callback signature.
export type sendUnaryData<ResponseType> =
    (error: ServiceError|null, value: ResponseType|null, trailer?: Metadata,
     flags?: number) => void;

// User provided handler for unary calls.
export type handleUnaryCall<RequestType, ResponseType> =
    (call: ServerUnaryCall<RequestType, ResponseType>,
     callback: sendUnaryData<ResponseType>) => void;

// User provided handler for client streaming calls.
export type handleClientStreamingCall<RequestType, ResponseType> =
    (call: ServerReadableStream<RequestType, ResponseType>,
     callback: sendUnaryData<ResponseType>) => void;

// User provided handler for server streaming calls.
export type handleServerStreamingCall<RequestType, ResponseType> =
    (call: ServerWritableStream<RequestType, ResponseType>) => void;

// User provided handler for bidirectional streaming calls.
export type handleBidiStreamingCall<RequestType, ResponseType> =
    (call: ServerDuplexStream<RequestType, ResponseType>) => void;

export type HandleCall<RequestType, ResponseType> =
    handleUnaryCall<RequestType, ResponseType>&
    handleClientStreamingCall<RequestType, ResponseType>&
    handleServerStreamingCall<RequestType, ResponseType>&
    handleBidiStreamingCall<RequestType, ResponseType>;

export type Handler<RequestType, ResponseType> = {
  func: HandleCall<RequestType, ResponseType>;
  serialize: Serialize<ResponseType>;
  deserialize: Deserialize<RequestType>;
  type: HandlerType;
};

export type HandlerType = 'bidi'|'clientStream'|'serverStream'|'unary';


// Internal class that wraps the HTTP2 request.
export class Http2ServerCallStream<RequestType, ResponseType> extends
    EventEmitter {
  cancelled = false;
  deadline: NodeJS.Timer|null = null;
  status: PartialServiceError = {code: Status.OK, details: 'OK'};

  constructor(
      private stream: http2.ServerHttp2Stream,
      private handler: Handler<RequestType, ResponseType>|null) {
    super();

    this.stream.once('error', (err: Error) => {
      this.sendError(err as ServiceError, Status.INTERNAL);
    });

    this.stream.once('close', () => {
      if (this.stream.rstCode === http2.constants.NGHTTP2_CANCEL) {
        this.cancelled = true;
        this.emit('cancelled', 'cancelled');
      }
    });
  }

  private get _metadataSent(): boolean {
    return this.stream.headersSent;
  }

  sendMetadata(customMetadata?: Metadata) {
    if (this._metadataSent) {
      return;
    }

    const custom = customMetadata ? customMetadata.toHttp2Headers() : null;
    // TODO(cjihrig): Include compression headers.
    const headers = Object.assign(defaultResponseHeaders, custom);

    this.stream.respond(headers, defaultResponseOptions);
    this.stream.once('wantTrailers', () => {
      let trailersToSend = {
        [GRPC_STATUS_HEADER]: this.status.code,
        [GRPC_MESSAGE_HEADER]: encodeURI(this.status.details as string)
      };
      const metadata = this.status.metadata;

      if (metadata) {
        trailersToSend =
            Object.assign(trailersToSend, metadata.toHttp2Headers());
      }

      this.stream.sendTrailers(trailersToSend);
    });
  }

  receiveMetadata(headers: http2.IncomingHttpHeaders) {
    const metadata = Metadata.fromHttp2Headers(headers);

    // TODO(cjihrig): Receive compression metadata.

    const timeoutHeader = metadata.get(GRPC_TIMEOUT_HEADER);

    if (timeoutHeader.length > 0) {
      const match = timeoutHeader[0].toString().match(DEADLINE_REGEX);

      if (match === null) {
        this.sendError(
            new Error('Invalid deadline') as ServiceError, Status.OUT_OF_RANGE);
        return;
      }

      const timeout = (+match[1] * deadlineUnitsToMs[match[2]]) | 0;

      this.deadline = setTimeout(handleExpiredDeadline, timeout, this);
      metadata.remove(GRPC_TIMEOUT_HEADER);
    }

    return metadata;
  }

  receiveUnaryMessage(): Promise<RequestType> {
    return new Promise((resolve, reject) => {
      const stream = this.stream;
      const chunks: Buffer[] = [];
      let totalLength = 0;

      stream.on('data', (data: Buffer) => {
        chunks.push(data);
        totalLength += data.byteLength;
      });

      stream.once('end', async () => {
        try {
          const requestBytes = Buffer.concat(chunks, totalLength);

          resolve(await this.deserializeMessage(requestBytes));
        } catch (err) {
          this.sendError(err, Status.INTERNAL);
          resolve();
        }
      });
    });
  }

  serializeMessage(value: ResponseType) {
    const handler = this.handler as Handler<RequestType, ResponseType>;
    const messageBuffer = handler.serialize(value);

    // TODO(cjihrig): Call compression aware serializeMessage().
    const byteLength = messageBuffer.byteLength;
    const output = Buffer.allocUnsafe(byteLength + 5);
    output.writeUInt8(0, 0);
    output.writeUInt32BE(byteLength, 1);
    messageBuffer.copy(output, 5);
    return output;
  }

  async deserializeMessage(bytes: Buffer) {
    const handler = this.handler as Handler<RequestType, ResponseType>;
    // TODO(cjihrig): Call compression aware deserializeMessage().
    const receivedMessage = bytes.slice(5);

    return handler.deserialize(receivedMessage);
  }

  async sendUnaryMessage(
      err: ServiceError|null, value: ResponseType|null, metadata?: Metadata,
      flags?: number) {
    if (err) {
      if (metadata) {
        err.metadata = metadata;
      }

      this.sendError(err);
      return;
    }

    try {
      const response = await this.serializeMessage(value as ResponseType);

      if (metadata) {
        this.status.metadata = metadata;
      }

      this.end(response);
    } catch (err) {
      this.sendError(err, Status.INTERNAL);
    }
  }

  sendError(error: ServiceError, code = Status.UNKNOWN) {
    const {status} = this;

    if (error.hasOwnProperty('message')) {
      status.details = error.message;
    } else {
      status.details = 'Unknown Error';
    }

    if (error.hasOwnProperty('code') && Number.isInteger(error.code)) {
      status.code = error.code;

      if (error.hasOwnProperty('details')) {
        status.details = error.details;
      }
    } else {
      status.code = code;
    }

    if (error.hasOwnProperty('metadata')) {
      status.metadata = error.metadata;
    }

    this.end();
  }

  write(chunk: Buffer) {
    if (this.cancelled === true) {
      return;
    }

    this.sendMetadata();
    return this.stream.write(chunk);
  }

  end(payload?: Buffer) {
    if (this.cancelled === true) {
      return;
    }

    if (this.deadline !== null) {
      clearTimeout(this.deadline);
      this.deadline = null;
    }

    this.sendMetadata();
    return this.stream.end(payload);
  }
}

// tslint:disable:no-any
type UntypedServerCall = Http2ServerCallStream<any, any>;

function handleExpiredDeadline(call: UntypedServerCall) {
  call.sendError(
      new Error('Deadline exceeded') as ServiceError, Status.DEADLINE_EXCEEDED);
  call.cancelled = true;
  call.emit('cancelled', 'deadline');
}
