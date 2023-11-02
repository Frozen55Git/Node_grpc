import * as assert from 'assert';
import * as path from 'path';
import { FileDescriptorProto } from 'google-protobuf/google/protobuf/descriptor_pb';
import * as protoLoader from '@grpc/proto-loader';

import { ReflectionV1Implementation } from '../src/reflection-v1-implementation';

describe('GrpcReflectionService', () => {
  let reflectionService: ReflectionV1Implementation;

  beforeEach(async () => {
    console.log(path.join(__dirname, '../proto/sample/sample.proto'));
    console.log([path.join(__dirname, '../proto/sample/vendor')]);
    const root = protoLoader.loadSync(path.join(__dirname, '../proto/sample/sample.proto'), {
      includeDirs: [path.join(__dirname, '../proto/sample/vendor')]
    });

    reflectionService = new ReflectionV1Implementation(root);
  });

  describe('listServices()', () => {
    it('lists all services', () => {
      const { service: services } = reflectionService.listServices('*');
      assert.equal(services.length, 1);
      assert(services.find((s) => s.name === 'sample.SampleService'));
    });
  });

  describe('fileByFilename()', () => {
    it('finds files with transitive dependencies', () => {
      const descriptors = reflectionService
        .fileByFilename('sample.proto')
        .fileDescriptorProto.map(FileDescriptorProto.deserializeBinary);

      const names = descriptors.map((desc) => desc.getName());
      assert.deepEqual(
        new Set(names),
        new Set(['sample.proto', 'vendor.proto', 'vendor_dependency.proto'])
      );
    });

    it('finds files with fewer transitive dependencies', () => {
      const descriptors = reflectionService
        .fileByFilename('vendor.proto')
        .fileDescriptorProto.map(FileDescriptorProto.deserializeBinary);

      const names = descriptors.map((desc) => desc.getName());
      assert.deepEqual(new Set(names), new Set(['vendor.proto', 'vendor_dependency.proto']));
    });

    it('finds files with no transitive dependencies', () => {
      const descriptors = reflectionService
        .fileByFilename('vendor_dependency.proto')
        .fileDescriptorProto.map(FileDescriptorProto.deserializeBinary);

      assert.equal(descriptors.length, 1);
      assert.equal(descriptors[0].getName(), 'vendor_dependency.proto');
    });

    it('merges files based on package name', () => {
      const descriptors = reflectionService
        .fileByFilename('vendor.proto')
        .fileDescriptorProto.map(FileDescriptorProto.deserializeBinary);

      const names = descriptors.map((desc) => desc.getName());
      assert(!names.includes('common.proto')); // file merged into vendor.proto
    });

    it('errors with no file found', () => {
      assert.throws(
        () => reflectionService.fileByFilename('nonexistent.proto'),
        'Proto file not found',
      );
    });
  });

  describe('fileContainingSymbol()', () => {
    it('finds symbols and returns transitive file dependencies', () => {
      const descriptors = reflectionService
        .fileContainingSymbol('sample.HelloRequest')
        .fileDescriptorProto.map(FileDescriptorProto.deserializeBinary);

      const names = descriptors.map((desc) => desc.getName());
      assert.deepEqual(
        new Set(names),
        new Set(['sample.proto', 'vendor.proto', 'vendor_dependency.proto']),
      );
    });

    it('finds imported message types', () => {
      const descriptors = reflectionService
        .fileContainingSymbol('vendor.CommonMessage')
        .fileDescriptorProto.map(FileDescriptorProto.deserializeBinary);

      const names = descriptors.map((desc) => desc.getName());
      assert.deepEqual(new Set(names), new Set(['vendor.proto', 'vendor_dependency.proto']));
    });

    it('finds transitively imported message types', () => {
      const descriptors = reflectionService
        .fileContainingSymbol('vendor.dependency.DependentMessage')
        .fileDescriptorProto.map(FileDescriptorProto.deserializeBinary);

      assert.equal(descriptors.length, 1);
      assert.equal(descriptors[0].getName(), 'vendor_dependency.proto');
    });

    it('finds nested message types', () => {
      const descriptors = reflectionService
        .fileContainingSymbol('sample.HelloRequest.HelloNested')
        .fileDescriptorProto.map(FileDescriptorProto.deserializeBinary);

      const names = descriptors.map((desc) => desc.getName());
      assert.deepEqual(
        new Set(names),
        new Set(['sample.proto', 'vendor.proto', 'vendor_dependency.proto']),
      );
    });

    it('merges files based on package name', () => {
      const descriptors = reflectionService
        .fileContainingSymbol('vendor.CommonMessage')
        .fileDescriptorProto.map(FileDescriptorProto.deserializeBinary);

      const names = descriptors.map((desc) => desc.getName());
      assert(!names.includes('common.proto')); // file merged into vendor.proto
    });

    it('errors with no symbol found', () => {
      assert.throws(
        () => reflectionService.fileContainingSymbol('non.existant.symbol'),
        'Symbol not found:',
      );
    });

    it('resolves references to method types', () => {
      const descriptors = reflectionService
        .fileContainingSymbol('sample.SampleService.Hello2')
        .fileDescriptorProto.map(FileDescriptorProto.deserializeBinary);

      const names = descriptors.map((desc) => desc.getName());
      assert.deepEqual(
        new Set(names),
        new Set(['sample.proto', 'vendor.proto', 'vendor_dependency.proto']),
      );
    });
  });

  describe('fileContainingExtension()', () => {
    it('finds extensions and returns transitive file dependencies', () => {
      const descriptors = reflectionService
        .fileContainingExtension('.vendor.CommonMessage', 101)
        .fileDescriptorProto.map(FileDescriptorProto.deserializeBinary);

      const names = descriptors.map((desc) => desc.getName());
      assert.deepEqual(new Set(names), new Set(['vendor.proto', 'vendor_dependency.proto']));
    });

    it('errors with no symbol found', () => {
      assert.throws(
        () => reflectionService.fileContainingExtension('non.existant.symbol', 0),
        'Extension not found',
      );
    });
  });

  describe('allExtensionNumbersOfType()', () => {
    it('finds extensions and returns transitive file dependencies', () => {
      const response = reflectionService.allExtensionNumbersOfType('.vendor.CommonMessage');

      assert.equal(response.extensionNumber.length, 1);
      assert.equal(response.extensionNumber[0], 101);
    });

    it('errors with no symbol found', () => {
      assert.throws(
        () => reflectionService.allExtensionNumbersOfType('non.existant.symbol'),
        'Extensions not found',
      );
    });
  });
});
