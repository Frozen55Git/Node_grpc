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

import {Call, StatusObject, WriteObject} from './call-stream';
import {Metadata} from './metadata';

/**
 * Filter classes represent related per-call logic and state that is primarily
 * used to modify incoming and outgoing data
 */
export interface Filter {
  sendMetadata(metadata: Promise<Metadata>): Promise<Metadata>;

  receiveMetadata(metadata: Promise<Metadata>): Promise<Metadata>;

  sendMessage(message: Promise<WriteObject>): Promise<WriteObject>;

  receiveMessage(message: Promise<Buffer>): Promise<Buffer>;

  receiveTrailers(status: Promise<StatusObject>): Promise<StatusObject>;
}

export abstract class BaseFilter {
  async sendMetadata(metadata: Promise<Metadata>): Promise<Metadata> {
    return metadata;
  }

  async receiveMetadata(metadata: Promise<Metadata>): Promise<Metadata> {
    return metadata;
  }

  async sendMessage(message: Promise<WriteObject>): Promise<WriteObject> {
    return message;
  }

  async receiveMessage(message: Promise<Buffer>): Promise<Buffer> {
    return message;
  }

  async receiveTrailers(status: Promise<StatusObject>): Promise<StatusObject> {
    return status;
  }
}

export interface FilterFactory<T extends Filter> {
  createFilter(callStream: Call): T;
}
