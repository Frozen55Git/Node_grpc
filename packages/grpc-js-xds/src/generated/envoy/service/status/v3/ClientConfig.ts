// Original file: deps/envoy-api/envoy/service/status/v3/csds.proto

import type { Node as _envoy_config_core_v3_Node, Node__Output as _envoy_config_core_v3_Node__Output } from '../../../../envoy/config/core/v3/Node';
import type { PerXdsConfig as _envoy_service_status_v3_PerXdsConfig, PerXdsConfig__Output as _envoy_service_status_v3_PerXdsConfig__Output } from '../../../../envoy/service/status/v3/PerXdsConfig';
import type { Any as _google_protobuf_Any, Any__Output as _google_protobuf_Any__Output } from '../../../../google/protobuf/Any';
import type { Timestamp as _google_protobuf_Timestamp, Timestamp__Output as _google_protobuf_Timestamp__Output } from '../../../../google/protobuf/Timestamp';
import type { ConfigStatus as _envoy_service_status_v3_ConfigStatus } from '../../../../envoy/service/status/v3/ConfigStatus';
import type { ClientResourceStatus as _envoy_admin_v3_ClientResourceStatus } from '../../../../envoy/admin/v3/ClientResourceStatus';
import type { UpdateFailureState as _envoy_admin_v3_UpdateFailureState, UpdateFailureState__Output as _envoy_admin_v3_UpdateFailureState__Output } from '../../../../envoy/admin/v3/UpdateFailureState';

/**
 * GenericXdsConfig is used to specify the config status and the dump
 * of any xDS resource identified by their type URL. It is the generalized
 * version of the now deprecated ListenersConfigDump, ClustersConfigDump etc
 * [#next-free-field: 10]
 */
export interface _envoy_service_status_v3_ClientConfig_GenericXdsConfig {
  /**
   * Type_url represents the fully qualified name of xDS resource type
   * like envoy.v3.Cluster, envoy.v3.ClusterLoadAssignment etc.
   */
  'type_url'?: (string);
  /**
   * Name of the xDS resource
   */
  'name'?: (string);
  /**
   * This is the :ref:`version_info <envoy_v3_api_field_service.discovery.v3.DiscoveryResponse.version_info>`
   * in the last processed xDS discovery response. If there are only
   * static bootstrap listeners, this field will be ""
   */
  'version_info'?: (string);
  /**
   * The xDS resource config. Actual content depends on the type
   */
  'xds_config'?: (_google_protobuf_Any | null);
  /**
   * Timestamp when the xDS resource was last updated
   */
  'last_updated'?: (_google_protobuf_Timestamp | null);
  /**
   * Per xDS resource config status. It is generated by management servers.
   * It will not be present if the CSDS server is an xDS client.
   */
  'config_status'?: (_envoy_service_status_v3_ConfigStatus | keyof typeof _envoy_service_status_v3_ConfigStatus);
  /**
   * Per xDS resource status from the view of a xDS client
   */
  'client_status'?: (_envoy_admin_v3_ClientResourceStatus | keyof typeof _envoy_admin_v3_ClientResourceStatus);
  /**
   * Set if the last update failed, cleared after the next successful
   * update. The *error_state* field contains the rejected version of
   * this particular resource along with the reason and timestamp. For
   * successfully updated or acknowledged resource, this field should
   * be empty.
   * [#not-implemented-hide:]
   */
  'error_state'?: (_envoy_admin_v3_UpdateFailureState | null);
  /**
   * Is static resource is true if it is specified in the config supplied
   * through the file at the startup.
   */
  'is_static_resource'?: (boolean);
}

/**
 * GenericXdsConfig is used to specify the config status and the dump
 * of any xDS resource identified by their type URL. It is the generalized
 * version of the now deprecated ListenersConfigDump, ClustersConfigDump etc
 * [#next-free-field: 10]
 */
export interface _envoy_service_status_v3_ClientConfig_GenericXdsConfig__Output {
  /**
   * Type_url represents the fully qualified name of xDS resource type
   * like envoy.v3.Cluster, envoy.v3.ClusterLoadAssignment etc.
   */
  'type_url': (string);
  /**
   * Name of the xDS resource
   */
  'name': (string);
  /**
   * This is the :ref:`version_info <envoy_v3_api_field_service.discovery.v3.DiscoveryResponse.version_info>`
   * in the last processed xDS discovery response. If there are only
   * static bootstrap listeners, this field will be ""
   */
  'version_info': (string);
  /**
   * The xDS resource config. Actual content depends on the type
   */
  'xds_config': (_google_protobuf_Any__Output | null);
  /**
   * Timestamp when the xDS resource was last updated
   */
  'last_updated': (_google_protobuf_Timestamp__Output | null);
  /**
   * Per xDS resource config status. It is generated by management servers.
   * It will not be present if the CSDS server is an xDS client.
   */
  'config_status': (keyof typeof _envoy_service_status_v3_ConfigStatus);
  /**
   * Per xDS resource status from the view of a xDS client
   */
  'client_status': (keyof typeof _envoy_admin_v3_ClientResourceStatus);
  /**
   * Set if the last update failed, cleared after the next successful
   * update. The *error_state* field contains the rejected version of
   * this particular resource along with the reason and timestamp. For
   * successfully updated or acknowledged resource, this field should
   * be empty.
   * [#not-implemented-hide:]
   */
  'error_state': (_envoy_admin_v3_UpdateFailureState__Output | null);
  /**
   * Is static resource is true if it is specified in the config supplied
   * through the file at the startup.
   */
  'is_static_resource': (boolean);
}

/**
 * All xds configs for a particular client.
 */
export interface ClientConfig {
  /**
   * Node for a particular client.
   */
  'node'?: (_envoy_config_core_v3_Node | null);
  /**
   * This field is deprecated in favor of generic_xds_configs which is
   * much simpler and uniform in structure.
   */
  'xds_config'?: (_envoy_service_status_v3_PerXdsConfig)[];
  /**
   * Represents generic xDS config and the exact config structure depends on
   * the type URL (like Cluster if it is CDS)
   */
  'generic_xds_configs'?: (_envoy_service_status_v3_ClientConfig_GenericXdsConfig)[];
}

/**
 * All xds configs for a particular client.
 */
export interface ClientConfig__Output {
  /**
   * Node for a particular client.
   */
  'node': (_envoy_config_core_v3_Node__Output | null);
  /**
   * This field is deprecated in favor of generic_xds_configs which is
   * much simpler and uniform in structure.
   */
  'xds_config': (_envoy_service_status_v3_PerXdsConfig__Output)[];
  /**
   * Represents generic xDS config and the exact config structure depends on
   * the type URL (like Cluster if it is CDS)
   */
  'generic_xds_configs': (_envoy_service_status_v3_ClientConfig_GenericXdsConfig__Output)[];
}
