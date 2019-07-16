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

/* This file implements gRFC A2 and the service config spec:
 * https://github.com/grpc/proposal/blob/master/A2-service-configs-in-dns.md
 * https://github.com/grpc/grpc/blob/master/doc/service_config.md */

import * as lbconfig from './load-balancing-config';
import { isString, isArray, isBoolean, isNumber } from 'util';
import * as os from 'os';

export interface MethodConfigName {
  service: string;
  method?: string;
}

export interface MethodConfig {
  name: MethodConfigName[];
  waitForReady?: boolean;
  timeout?: string;
  maxRequestBytes?: number;
  maxResponseBytes?: number;
}

export interface ServiceConfig {
  loadBalancingPolicy?: string;
  loadBalancingConfig: lbconfig.LoadBalancingConfig[]
  methodConfig: MethodConfig[];
}

export interface ServiceConfigCanaryConfig {
  clientLanguage?: string[];
  percentage?: number;
  clientHostname?: string[];
  serviceConfig: ServiceConfig;
}

const TIMEOUT_REGEX = /^\d+(\.\d{1,9})?s$/;

const CLIENT_LANGUAGE_STRING = 'node';

function validateName(obj: any): MethodConfigName {
  if (!('service' in obj) || !isString(obj.service)) {
    throw new Error('Invalid method config name: invalid service');
  }
  const result: MethodConfigName = {
    service: obj.service
  };
  if ('method' in obj) {
    if (isString(obj.method)) {
      result.method = obj.method;
    } else {
      throw new Error('Invalid method config name: invalid method');
    }
  }
  return result;
}

function validateMethodConfig(obj: any): MethodConfig {
  const result: MethodConfig = {
    name: []
  };
  if (!('name' in obj) || !isArray(obj.name)) {
    throw new Error('Invalid method config: invalid name array');
  }
  for (const name of obj.name) {
    result.name.push(validateName(name));
  }
  if ('waitForReady' in obj) {
    if (!isBoolean(obj.waitForReady)) {
      throw new Error('Invalid method config: invalid waitForReady');
    }
    result.waitForReady = obj.waitForReady;
  }
  if ('timeout' in obj) {
    if (!isString(obj.timeout) || !TIMEOUT_REGEX.test(obj.timeout)) {
      throw new Error('Invalid method config: invalid timeout');
    }
    result.timeout = obj.timeout;
  }
  if ('maxRequestBytes' in obj) {
    if (!isNumber(obj.maxRequestBytes)) {
      throw new Error('Invalid method config: invalid maxRequestBytes');
    }
    result.maxRequestBytes = obj.maxRequestBytes;
  }
  if ('maxResponseBytes' in obj) {
    if (!isNumber(obj.maxResponseBytes)) {
      throw new Error('Invalid method config: invalid maxRequestBytes');
    }
    result.maxResponseBytes = obj.maxResponseBytes;
  }
  return result;
}

function validateServiceConfig(obj: any): ServiceConfig {
  const result: ServiceConfig = {
    loadBalancingConfig: [],
    methodConfig: []
  };
  if ('loadBalancingPolicy' in obj) {
    if (isString(obj.loadBalancingPolicy)) {
      result.loadBalancingPolicy = obj.loadBalancingPolicy;
    } else {
      throw new Error('Invalid service config: invalid loadBalancingPolicy');
    }
  }
  if ('loadBalancingConfig' in obj) {
    if (isArray(obj.loadBalancingConfig)) {
      for (const config of obj.loadBalancingConfig) {
        result.loadBalancingConfig.push(lbconfig.validateConfig(config));
      }
    } else {
      throw new Error('Invalid service config: invalid loadBalancingConfig');
    }
  }
  if ('methodConfig' in obj) {
    if (isArray(obj.methodConfig)) {
      for (const methodConfig of obj.methodConfig) {
        result.methodConfig.push(validateMethodConfig(methodConfig));
      }
    }
  }
  // Validate method name uniqueness
  const seenMethodNames: MethodConfigName[] = [];
  for (const methodConfig of result.methodConfig) {
    for (const name of methodConfig.name) {
      for (const seenName of seenMethodNames) {
        if (name.service === seenName.service && name.method === seenName.method) {
          throw new Error(`Invalid service config: duplicate name ${name.service}/${name.method}`);
        }
      }
      seenMethodNames.push(name);
    }
  }
  return result;
}

function validateCanaryConfig(obj: any): ServiceConfigCanaryConfig {
  if (!('serviceConfig' in obj)) {
    throw new Error('Invalid service config choice: missing service config');
  }
  const result: ServiceConfigCanaryConfig = {
    serviceConfig: validateServiceConfig(obj.serviceConfig)
  }
  if ('clientLanguage' in obj) {
    if (isArray(obj.clientLanguage)) {
      result.clientLanguage = [];
      for (const lang of obj.clientLanguage) {
        if (isString(lang)) {
          result.clientLanguage.push(lang);
        } else {
          throw new Error('Invalid service config choice: invalid clientLanguage');
        }
      }
    } else {
      throw new Error('Invalid service config choice: invalid clientLanguage');
    }
  }
  if ('clientHostname' in obj) {
    if (isArray(obj.clientHostname)) {
      result.clientHostname = [];
      for (const lang of obj.clientHostname) {
        if (isString(lang)) {
          result.clientHostname.push(lang);
        } else {
          throw new Error('Invalid service config choice: invalid clientHostname');
        }
      }
    } else {
      throw new Error('Invalid service config choice: invalid clientHostname');
    }
  }
  if ('percentage' in obj) {
    if (isNumber(obj.percentage) && 0 <= obj.percentage && obj.percentage <= 100) {
      result.percentage = obj.percentage;
    } else {
      throw new Error('Invalid service config choice: invalid percentage');
    }
  }
  // Validate that no unexpected fields are present
  const allowedFields = ['clientLanguage', 'percentage', 'clientHostname', 'serviceConfig'];
  for (const field in obj) {
    if (!allowedFields.includes(field)) {
      throw new Error(`Invalid service config choice: unexpected field ${field}`);
    }
  }
  return result;
}

function validateAndSelectCanaryConfig(obj: any, percentage: number): ServiceConfig {
  if (!isArray(obj)) {
    throw new Error('Invalid service config list');
  }
  for (const config of obj) {
    const validatedConfig = validateCanaryConfig(config);
    /* For each field, we check if it is present, then only discard the
     * config if the field value does not match the current client */
    if (isNumber(validatedConfig.percentage) && percentage > validatedConfig.percentage) {
      continue;
    }
    if (isArray(validatedConfig.clientHostname)) {
      let hostnameMatched = false;
      for (const hostname of validatedConfig.clientHostname) {
        if (hostname === os.hostname()) {
          hostnameMatched = true;
        }
      }
      if (!hostnameMatched) {
        continue;
      }
    }
    if (isArray(validatedConfig.clientLanguage)) {
      let languageMatched = false;
      for (const language of validatedConfig.clientLanguage) {
        if (language === CLIENT_LANGUAGE_STRING) {
          languageMatched = true;
        }
      }
      if (!languageMatched) {
        continue;
      }
    }
    return validatedConfig.serviceConfig;
  }
  throw new Error('No matching service config found');
}

/**
 * Find the "grpc_config" record among the TXT records, parse its value as JSON, validate its contents,
 * and select a service config with selection fields that all match this client. Most of these steps
 * can fail with an error; the caller must handle any errors thrown this way.
 * @param txtRecord The TXT record array that is output from a successful call to dns.resolveTxt
 * @param percentage A number chosen from the range [0, 100) that is used to select which config to use
 */
export function extractAndSelectServiceConfig(txtRecord: string[][], percentage: number): ServiceConfig | null {
  for (const record of txtRecord) {
    if (record.length > 0 && record[0].startsWith('grpc_config=')) {
      const recordString = [record[0].substring('grpc_config='.length)].concat(record.slice(1)).join('');
      const recordJson: any = JSON.parse(recordString);
      return validateAndSelectCanaryConfig(recordJson, percentage);
    }
  }
  return null;
}