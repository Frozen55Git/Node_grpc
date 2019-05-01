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

import * as http2 from 'http2';
import {AddressInfo, ListenOptions} from 'net';
import {URL} from 'url';

import {ServiceError} from './call';
import {StatusObject} from './call-stream';
import {Status} from './constants';
import {Deserialize, Serialize, ServiceDefinition} from './make-client';
import {Metadata} from './metadata';
import {HandleCall, Handler, HandlerType, Http2ServerCallStream, PartialServiceError, sendUnaryData, ServerDuplexStream, ServerDuplexStreamImpl, ServerReadableStream, ServerReadableStreamImpl, ServerUnaryCall, ServerUnaryCallImpl, ServerWritableStream, ServerWritableStreamImpl} from './server-call';
import {ServerCredentials} from './server-credentials';

function noop(): void {}

const unimplementedStatusResponse: PartialServiceError = {
  code: Status.UNIMPLEMENTED,
  details: 'The server does not implement this method',
};

// tslint:disable:no-any
type UntypedHandleCall = HandleCall<any, any>;
type UntypedHandler = Handler<any, any>;
type UntypedServiceImplementation = {
  [name: string]: UntypedHandleCall
};

const defaultHandler = {
  unary(call: ServerUnaryCall<any, any>, callback: sendUnaryData<any>): void {
    callback(unimplementedStatusResponse as ServiceError, null);
  },
  clientStream(
      call: ServerReadableStream<any, any>, callback: sendUnaryData<any>):
      void {
        callback(unimplementedStatusResponse as ServiceError, null);
      },
  serverStream(call: ServerWritableStream<any, any>): void {
    call.emit('error', unimplementedStatusResponse);
  },
  bidi(call: ServerDuplexStream<any, any>): void {
    call.emit('error', unimplementedStatusResponse);
  }
};
// tslint:enable:no-any

export class Server {
  private http2Server: http2.Http2Server|http2.Http2SecureServer|null = null;
  private handlers: Map<string, UntypedHandler> =
      new Map<string, UntypedHandler>();
  private started = false;

  constructor(options?: object) {}

  addProtoService(): void {
    throw new Error('Not implemented. Use addService() instead');
  }

  addService(service: ServiceDefinition, implementation: object): void {
    if (this.started === true) {
      throw new Error('Can\'t add a service to a started server.');
    }

    if (service === null || typeof service !== 'object' ||
        implementation === null || typeof implementation !== 'object') {
      throw new Error('addService() requires two objects as arguments');
    }

    const serviceKeys = Object.keys(service);

    if (serviceKeys.length === 0) {
      throw new Error('Cannot add an empty service to a server');
    }

    const implMap: UntypedServiceImplementation =
        implementation as UntypedServiceImplementation;

    serviceKeys.forEach((name) => {
      const attrs = service[name];
      let methodType: HandlerType;

      if (attrs.requestStream) {
        if (attrs.responseStream) {
          methodType = 'bidi';
        } else {
          methodType = 'clientStream';
        }
      } else {
        if (attrs.responseStream) {
          methodType = 'serverStream';
        } else {
          methodType = 'unary';
        }
      }

      let implFn = implMap[name];
      let impl;

      if (implFn === undefined && typeof attrs.originalName === 'string') {
        implFn = implMap[attrs.originalName];
      }

      if (implFn !== undefined) {
        impl = implFn.bind(implementation);
      } else {
        impl = defaultHandler[methodType];
      }

      const success = this.register(
          attrs.path, impl as UntypedHandleCall, attrs.responseSerialize,
          attrs.requestDeserialize, methodType);

      if (success === false) {
        throw new Error(`Method handler for ${attrs.path} already provided.`);
      }
    });
  }

  bind(port: string, creds: ServerCredentials): void {
    throw new Error('Not implemented. Use bindAsync() instead');
  }

  bindAsync(
      port: string, creds: ServerCredentials,
      callback: (error: Error|null, port: number) => void): void {
    if (this.started === true) {
      throw new Error('server is already started');
    }

    if (typeof port !== 'string') {
      throw new TypeError('port must be a string');
    }

    if (creds === null || typeof creds !== 'object') {
      throw new TypeError('creds must be an object');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be a function');
    }

    const url = new URL(`http://${port}`);
    const options: ListenOptions = {host: url.hostname, port: +url.port};

    if (creds._isSecure()) {
      this.http2Server = http2.createSecureServer(
          creds._getSettings() as http2.SecureServerOptions);
    } else {
      this.http2Server = http2.createServer();
    }

    this._setupHandlers();

    function onError(err: Error): void {
      callback(err, -1);
    }

    this.http2Server.once('error', onError);

    this.http2Server.listen(options, () => {
      const server =
          this.http2Server as http2.Http2Server | http2.Http2SecureServer;
      const port = (server.address() as AddressInfo).port;

      server.removeListener('error', onError);
      callback(null, port);
    });
  }

  forceShutdown(): void {
    throw new Error('Not yet implemented');
  }

  register<RequestType, ResponseType>(
      name: string, handler: HandleCall<RequestType, ResponseType>,
      serialize: Serialize<ResponseType>, deserialize: Deserialize<RequestType>,
      type: string): boolean {
    if (this.handlers.has(name)) {
      return false;
    }

    this.handlers.set(
        name,
        {func: handler, serialize, deserialize, type: type as HandlerType});
    return true;
  }

  start(): void {
    if (this.http2Server === null || this.http2Server.listening !== true) {
      throw new Error('server must be bound in order to start');
    }

    if (this.started === true) {
      throw new Error('server is already started');
    }

    this.started = true;
  }

  tryShutdown(callback: (error?: Error) => void): void {
    callback = typeof callback === 'function' ? callback : noop;

    if (this.http2Server === null) {
      callback(new Error('server is not running'));
      return;
    }

    this.http2Server.close((err?: Error) => {
      this.started = false;
      callback(err);
    });
  }

  addHttp2Port(): void {
    throw new Error('Not yet implemented');
  }

  private _setupHandlers(): void {
    if (this.http2Server === null) {
      return;
    }

    this.http2Server.on(
        'stream',
        (stream: http2.ServerHttp2Stream,
         headers: http2.IncomingHttpHeaders) => {
          if (this.started !== true) {
            stream.end();
            return;
          }

          try {
            const path = headers[http2.constants.HTTP2_HEADER_PATH] as string;
            const handler = this.handlers.get(path);

            if (handler === undefined) {
              throw unimplementedStatusResponse;
            }

            const call = new Http2ServerCallStream(stream, handler);
            const metadata: Metadata =
                call.receiveMetadata(headers) as Metadata;

            switch (handler.type) {
              case 'unary':
                handleUnary(call, handler, metadata);
                break;
              case 'clientStream':
                handleClientStreaming(call, handler, metadata);
                break;
              case 'serverStream':
                handleServerStreaming(call, handler, metadata);
                break;
              case 'bidi':
                handleBidiStreaming(call, handler, metadata);
                break;
              default:
                throw new Error(`Unknown handler type: ${handler.type}`);
            }
          } catch (err) {
            const call = new Http2ServerCallStream(stream, null);
            err.code = Status.INTERNAL;
            call.sendError(err);
          }
        });
  }
}


async function handleUnary<RequestType, ResponseType>(
    call: Http2ServerCallStream<RequestType, ResponseType>,
    handler: Handler<RequestType, ResponseType>,
    metadata: Metadata): Promise<void> {
  const emitter =
      new ServerUnaryCallImpl<RequestType, ResponseType>(call, metadata);
  const request = await call.receiveUnaryMessage();

  if (request === undefined || call.cancelled === true) {
    return;
  }

  emitter.request = request;
  handler.func(
      emitter,
      (err: ServiceError|null, value: ResponseType|null, trailer?: Metadata,
       flags?: number) => {
        call.sendUnaryMessage(err, value, trailer, flags);
      });
}


function handleClientStreaming<RequestType, ResponseType>(
    call: Http2ServerCallStream<RequestType, ResponseType>,
    handler: Handler<RequestType, ResponseType>, metadata: Metadata): void {
  throw new Error('not implemented yet');
}


async function handleServerStreaming<RequestType, ResponseType>(
    call: Http2ServerCallStream<RequestType, ResponseType>,
    handler: Handler<RequestType, ResponseType>,
    metadata: Metadata): Promise<void> {
  const request = await call.receiveUnaryMessage();

  if (request === undefined || call.cancelled === true) {
    return;
  }

  const stream = new ServerWritableStreamImpl<RequestType, ResponseType>(
      call, metadata, handler.serialize);

  stream.request = request;
  handler.func(stream);
}


function handleBidiStreaming<RequestType, ResponseType>(
    call: Http2ServerCallStream<RequestType, ResponseType>,
    handler: Handler<RequestType, ResponseType>, metadata: Metadata): void {
  throw new Error('not implemented yet');
}
