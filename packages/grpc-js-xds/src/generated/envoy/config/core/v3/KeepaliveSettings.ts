// Original file: deps/envoy-api/envoy/config/core/v3/protocol.proto

import type { Duration as _google_protobuf_Duration, Duration__Output as _google_protobuf_Duration__Output } from '../../../../google/protobuf/Duration';
import type { Percent as _envoy_type_v3_Percent, Percent__Output as _envoy_type_v3_Percent__Output } from '../../../../envoy/type/v3/Percent';

export interface KeepaliveSettings {
  /**
   * Send HTTP/2 PING frames at this period, in order to test that the connection is still alive.
   */
  'interval'?: (_google_protobuf_Duration | null);
  /**
   * How long to wait for a response to a keepalive PING. If a response is not received within this
   * time period, the connection will be aborted.
   */
  'timeout'?: (_google_protobuf_Duration | null);
  /**
   * A random jitter amount as a percentage of interval that will be added to each interval.
   * A value of zero means there will be no jitter.
   * The default value is 15%.
   */
  'interval_jitter'?: (_envoy_type_v3_Percent | null);
}

export interface KeepaliveSettings__Output {
  /**
   * Send HTTP/2 PING frames at this period, in order to test that the connection is still alive.
   */
  'interval': (_google_protobuf_Duration__Output | null);
  /**
   * How long to wait for a response to a keepalive PING. If a response is not received within this
   * time period, the connection will be aborted.
   */
  'timeout': (_google_protobuf_Duration__Output | null);
  /**
   * A random jitter amount as a percentage of interval that will be added to each interval.
   * A value of zero means there will be no jitter.
   * The default value is 15%.
   */
  'interval_jitter': (_envoy_type_v3_Percent__Output | null);
}
