// Original file: deps/googleapis/google/longrunning/operations.proto

import * as grpc from '@grpc/grpc-js'
import { CancelOperationRequest as _google_longrunning_CancelOperationRequest, CancelOperationRequest__Output as _google_longrunning_CancelOperationRequest__Output } from '../../google/longrunning/CancelOperationRequest';
import { DeleteOperationRequest as _google_longrunning_DeleteOperationRequest, DeleteOperationRequest__Output as _google_longrunning_DeleteOperationRequest__Output } from '../../google/longrunning/DeleteOperationRequest';
import { Empty as _google_protobuf_Empty, Empty__Output as _google_protobuf_Empty__Output } from '../../google/protobuf/Empty';
import { GetOperationRequest as _google_longrunning_GetOperationRequest, GetOperationRequest__Output as _google_longrunning_GetOperationRequest__Output } from '../../google/longrunning/GetOperationRequest';
import { ListOperationsRequest as _google_longrunning_ListOperationsRequest, ListOperationsRequest__Output as _google_longrunning_ListOperationsRequest__Output } from '../../google/longrunning/ListOperationsRequest';
import { ListOperationsResponse as _google_longrunning_ListOperationsResponse, ListOperationsResponse__Output as _google_longrunning_ListOperationsResponse__Output } from '../../google/longrunning/ListOperationsResponse';
import { Operation as _google_longrunning_Operation, Operation__Output as _google_longrunning_Operation__Output } from '../../google/longrunning/Operation';
import { WaitOperationRequest as _google_longrunning_WaitOperationRequest, WaitOperationRequest__Output as _google_longrunning_WaitOperationRequest__Output } from '../../google/longrunning/WaitOperationRequest';

/**
 * Manages long-running operations with an API service.
 * 
 * When an API method normally takes long time to complete, it can be designed
 * to return [Operation][google.longrunning.Operation] to the client, and the client can use this
 * interface to receive the real response asynchronously by polling the
 * operation resource, or pass the operation resource to another API (such as
 * Google Cloud Pub/Sub API) to receive the response.  Any API service that
 * returns long-running operations should implement the `Operations` interface
 * so developers can have a consistent client experience.
 */
export interface OperationsClient extends grpc.Client {
  /**
   * Starts asynchronous cancellation on a long-running operation.  The server
   * makes a best effort to cancel the operation, but success is not
   * guaranteed.  If the server doesn't support this method, it returns
   * `google.rpc.Code.UNIMPLEMENTED`.  Clients can use
   * [Operations.GetOperation][google.longrunning.Operations.GetOperation] or
   * other methods to check whether the cancellation succeeded or whether the
   * operation completed despite cancellation. On successful cancellation,
   * the operation is not deleted; instead, it becomes an operation with
   * an [Operation.error][google.longrunning.Operation.error] value with a [google.rpc.Status.code][google.rpc.Status.code] of 1,
   * corresponding to `Code.CANCELLED`.
   */
  CancelOperation(argument: _google_longrunning_CancelOperationRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  CancelOperation(argument: _google_longrunning_CancelOperationRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  CancelOperation(argument: _google_longrunning_CancelOperationRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  CancelOperation(argument: _google_longrunning_CancelOperationRequest, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  /**
   * Starts asynchronous cancellation on a long-running operation.  The server
   * makes a best effort to cancel the operation, but success is not
   * guaranteed.  If the server doesn't support this method, it returns
   * `google.rpc.Code.UNIMPLEMENTED`.  Clients can use
   * [Operations.GetOperation][google.longrunning.Operations.GetOperation] or
   * other methods to check whether the cancellation succeeded or whether the
   * operation completed despite cancellation. On successful cancellation,
   * the operation is not deleted; instead, it becomes an operation with
   * an [Operation.error][google.longrunning.Operation.error] value with a [google.rpc.Status.code][google.rpc.Status.code] of 1,
   * corresponding to `Code.CANCELLED`.
   */
  cancelOperation(argument: _google_longrunning_CancelOperationRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  cancelOperation(argument: _google_longrunning_CancelOperationRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  cancelOperation(argument: _google_longrunning_CancelOperationRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  cancelOperation(argument: _google_longrunning_CancelOperationRequest, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  
  /**
   * Deletes a long-running operation. This method indicates that the client is
   * no longer interested in the operation result. It does not cancel the
   * operation. If the server doesn't support this method, it returns
   * `google.rpc.Code.UNIMPLEMENTED`.
   */
  DeleteOperation(argument: _google_longrunning_DeleteOperationRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  DeleteOperation(argument: _google_longrunning_DeleteOperationRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  DeleteOperation(argument: _google_longrunning_DeleteOperationRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  DeleteOperation(argument: _google_longrunning_DeleteOperationRequest, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  /**
   * Deletes a long-running operation. This method indicates that the client is
   * no longer interested in the operation result. It does not cancel the
   * operation. If the server doesn't support this method, it returns
   * `google.rpc.Code.UNIMPLEMENTED`.
   */
  deleteOperation(argument: _google_longrunning_DeleteOperationRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  deleteOperation(argument: _google_longrunning_DeleteOperationRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  deleteOperation(argument: _google_longrunning_DeleteOperationRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  deleteOperation(argument: _google_longrunning_DeleteOperationRequest, callback: (error?: grpc.ServiceError, result?: _google_protobuf_Empty__Output) => void): grpc.ClientUnaryCall;
  
  /**
   * Gets the latest state of a long-running operation.  Clients can use this
   * method to poll the operation result at intervals as recommended by the API
   * service.
   */
  GetOperation(argument: _google_longrunning_GetOperationRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  GetOperation(argument: _google_longrunning_GetOperationRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  GetOperation(argument: _google_longrunning_GetOperationRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  GetOperation(argument: _google_longrunning_GetOperationRequest, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  /**
   * Gets the latest state of a long-running operation.  Clients can use this
   * method to poll the operation result at intervals as recommended by the API
   * service.
   */
  getOperation(argument: _google_longrunning_GetOperationRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  getOperation(argument: _google_longrunning_GetOperationRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  getOperation(argument: _google_longrunning_GetOperationRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  getOperation(argument: _google_longrunning_GetOperationRequest, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  
  /**
   * Lists operations that match the specified filter in the request. If the
   * server doesn't support this method, it returns `UNIMPLEMENTED`.
   * 
   * NOTE: the `name` binding allows API services to override the binding
   * to use different resource name schemes, such as `users/* /operations`. To
   * override the binding, API services can add a binding such as
   * `"/v1/{name=users/*}/operations"` to their service configuration.
   * For backwards compatibility, the default name includes the operations
   * collection id, however overriding users must ensure the name binding
   * is the parent resource, without the operations collection id.
   */
  ListOperations(argument: _google_longrunning_ListOperationsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_ListOperationsResponse__Output) => void): grpc.ClientUnaryCall;
  ListOperations(argument: _google_longrunning_ListOperationsRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _google_longrunning_ListOperationsResponse__Output) => void): grpc.ClientUnaryCall;
  ListOperations(argument: _google_longrunning_ListOperationsRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_ListOperationsResponse__Output) => void): grpc.ClientUnaryCall;
  ListOperations(argument: _google_longrunning_ListOperationsRequest, callback: (error?: grpc.ServiceError, result?: _google_longrunning_ListOperationsResponse__Output) => void): grpc.ClientUnaryCall;
  /**
   * Lists operations that match the specified filter in the request. If the
   * server doesn't support this method, it returns `UNIMPLEMENTED`.
   * 
   * NOTE: the `name` binding allows API services to override the binding
   * to use different resource name schemes, such as `users/* /operations`. To
   * override the binding, API services can add a binding such as
   * `"/v1/{name=users/*}/operations"` to their service configuration.
   * For backwards compatibility, the default name includes the operations
   * collection id, however overriding users must ensure the name binding
   * is the parent resource, without the operations collection id.
   */
  listOperations(argument: _google_longrunning_ListOperationsRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_ListOperationsResponse__Output) => void): grpc.ClientUnaryCall;
  listOperations(argument: _google_longrunning_ListOperationsRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _google_longrunning_ListOperationsResponse__Output) => void): grpc.ClientUnaryCall;
  listOperations(argument: _google_longrunning_ListOperationsRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_ListOperationsResponse__Output) => void): grpc.ClientUnaryCall;
  listOperations(argument: _google_longrunning_ListOperationsRequest, callback: (error?: grpc.ServiceError, result?: _google_longrunning_ListOperationsResponse__Output) => void): grpc.ClientUnaryCall;
  
  /**
   * Waits for the specified long-running operation until it is done or reaches
   * at most a specified timeout, returning the latest state.  If the operation
   * is already done, the latest state is immediately returned.  If the timeout
   * specified is greater than the default HTTP/RPC timeout, the HTTP/RPC
   * timeout is used.  If the server does not support this method, it returns
   * `google.rpc.Code.UNIMPLEMENTED`.
   * Note that this method is on a best-effort basis.  It may return the latest
   * state before the specified timeout (including immediately), meaning even an
   * immediate response is no guarantee that the operation is done.
   */
  WaitOperation(argument: _google_longrunning_WaitOperationRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  WaitOperation(argument: _google_longrunning_WaitOperationRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  WaitOperation(argument: _google_longrunning_WaitOperationRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  WaitOperation(argument: _google_longrunning_WaitOperationRequest, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  /**
   * Waits for the specified long-running operation until it is done or reaches
   * at most a specified timeout, returning the latest state.  If the operation
   * is already done, the latest state is immediately returned.  If the timeout
   * specified is greater than the default HTTP/RPC timeout, the HTTP/RPC
   * timeout is used.  If the server does not support this method, it returns
   * `google.rpc.Code.UNIMPLEMENTED`.
   * Note that this method is on a best-effort basis.  It may return the latest
   * state before the specified timeout (including immediately), meaning even an
   * immediate response is no guarantee that the operation is done.
   */
  waitOperation(argument: _google_longrunning_WaitOperationRequest, metadata: grpc.Metadata, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  waitOperation(argument: _google_longrunning_WaitOperationRequest, metadata: grpc.Metadata, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  waitOperation(argument: _google_longrunning_WaitOperationRequest, options: grpc.CallOptions, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  waitOperation(argument: _google_longrunning_WaitOperationRequest, callback: (error?: grpc.ServiceError, result?: _google_longrunning_Operation__Output) => void): grpc.ClientUnaryCall;
  
}

/**
 * Manages long-running operations with an API service.
 * 
 * When an API method normally takes long time to complete, it can be designed
 * to return [Operation][google.longrunning.Operation] to the client, and the client can use this
 * interface to receive the real response asynchronously by polling the
 * operation resource, or pass the operation resource to another API (such as
 * Google Cloud Pub/Sub API) to receive the response.  Any API service that
 * returns long-running operations should implement the `Operations` interface
 * so developers can have a consistent client experience.
 */
export interface OperationsHandlers {
  /**
   * Starts asynchronous cancellation on a long-running operation.  The server
   * makes a best effort to cancel the operation, but success is not
   * guaranteed.  If the server doesn't support this method, it returns
   * `google.rpc.Code.UNIMPLEMENTED`.  Clients can use
   * [Operations.GetOperation][google.longrunning.Operations.GetOperation] or
   * other methods to check whether the cancellation succeeded or whether the
   * operation completed despite cancellation. On successful cancellation,
   * the operation is not deleted; instead, it becomes an operation with
   * an [Operation.error][google.longrunning.Operation.error] value with a [google.rpc.Status.code][google.rpc.Status.code] of 1,
   * corresponding to `Code.CANCELLED`.
   */
  CancelOperation(call: grpc.ServerUnaryCall<_google_longrunning_CancelOperationRequest__Output, _google_protobuf_Empty>, callback: grpc.sendUnaryData<_google_protobuf_Empty>): void;
  
  /**
   * Deletes a long-running operation. This method indicates that the client is
   * no longer interested in the operation result. It does not cancel the
   * operation. If the server doesn't support this method, it returns
   * `google.rpc.Code.UNIMPLEMENTED`.
   */
  DeleteOperation(call: grpc.ServerUnaryCall<_google_longrunning_DeleteOperationRequest__Output, _google_protobuf_Empty>, callback: grpc.sendUnaryData<_google_protobuf_Empty>): void;
  
  /**
   * Gets the latest state of a long-running operation.  Clients can use this
   * method to poll the operation result at intervals as recommended by the API
   * service.
   */
  GetOperation(call: grpc.ServerUnaryCall<_google_longrunning_GetOperationRequest__Output, _google_longrunning_Operation>, callback: grpc.sendUnaryData<_google_longrunning_Operation>): void;
  
  /**
   * Lists operations that match the specified filter in the request. If the
   * server doesn't support this method, it returns `UNIMPLEMENTED`.
   * 
   * NOTE: the `name` binding allows API services to override the binding
   * to use different resource name schemes, such as `users/* /operations`. To
   * override the binding, API services can add a binding such as
   * `"/v1/{name=users/*}/operations"` to their service configuration.
   * For backwards compatibility, the default name includes the operations
   * collection id, however overriding users must ensure the name binding
   * is the parent resource, without the operations collection id.
   */
  ListOperations(call: grpc.ServerUnaryCall<_google_longrunning_ListOperationsRequest__Output, _google_longrunning_ListOperationsResponse>, callback: grpc.sendUnaryData<_google_longrunning_ListOperationsResponse>): void;
  
  /**
   * Waits for the specified long-running operation until it is done or reaches
   * at most a specified timeout, returning the latest state.  If the operation
   * is already done, the latest state is immediately returned.  If the timeout
   * specified is greater than the default HTTP/RPC timeout, the HTTP/RPC
   * timeout is used.  If the server does not support this method, it returns
   * `google.rpc.Code.UNIMPLEMENTED`.
   * Note that this method is on a best-effort basis.  It may return the latest
   * state before the specified timeout (including immediately), meaning even an
   * immediate response is no guarantee that the operation is done.
   */
  WaitOperation(call: grpc.ServerUnaryCall<_google_longrunning_WaitOperationRequest__Output, _google_longrunning_Operation>, callback: grpc.sendUnaryData<_google_longrunning_Operation>): void;
  
}
