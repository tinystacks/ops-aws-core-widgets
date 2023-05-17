import { cleanup } from '@testing-library/react';
import { AwsJsonTree } from '../../src/aws-widgets/aws-json-tree.js'

describe('AwsJsonTree', () => {
  afterEach(cleanup);
  
  describe('AwsJsonTree intialization', () => {
    it('AwsJsonTree is initialized successfully', () => {
      const props = {
        id: 'MockWidget',
        type: 'AwsJsonTree',
        displayName: 'mock widget', 
        region: 'us-east-1', 
        cloudControlType: 'cloud-control-type'
      };
      
      const iamJson = AwsJsonTree.fromJson(props);
      expect(iamJson.toJson()).toStrictEqual({
        ...props,
        resourceModel: undefined,
        paths: undefined,
        childrenIds: undefined,
        description: undefined,
        displayOptions: undefined,
        providerIds: undefined, 
      });
    });

  });

});

describe('AwsJsonTree getData function', () => {
const mockfromSSO = jest.fn();

const mockFromIni = jest.fn();

jest.mock('@aws-sdk/credential-provider-ini', () => ({ fromIni: jest.fn(() => mockFromIni)
}));

jest.mock('@aws-sdk/credential-provider-sso', () => ({
  fromSSO: jest.fn(() => mockfromSSO)
}));
  let mockProviders;
  let mockOverrides;
  let widget;
  let mockCloudControlClient;
  let mockListResources;
  let mockAwsCredentialsProvider;

  beforeEach(() => {
    mockProviders = [
      {
        type: 'AwsCredentialsProvider',
        id: 'test-provider',
        getCredentials: jest.fn().mockResolvedValue({
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
          sessionToken: 'sessionToken'
        })
      }
    ];
    mockOverrides = {};
    widget = new AwsJsonTree({
      id: 'MockWidget',
      type: 'AwsJsonTree',
      displayName: 'mock cw widget', 
      region: 'us-east-1', 
      cloudControlType: 'cloud-control-type'
    });

    mockCloudControlClient = {
      listResources: jest.fn(),
    };

    mockListResources = {
      promise: jest.fn(),
    };

    mockCloudControlClient.listResources.mockReturnValue(mockListResources);
    
    mockAwsCredentialsProvider = {
      getCredentials: jest.fn().mockResolvedValue('mocked credentials'),
    };

  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw an error if providers is not an array or is empty', async () => {
    await expect(widget.getData(null, mockOverrides)).rejects.toThrow('An AwsCredentialsProvider was expected, but was not given');
    await expect(widget.getData([], mockOverrides)).rejects.toThrow('An AwsCredentialsProvider was expected, but was not given');
  });

  it('should throw an error if the first provider is not an AwsCredentialsProvider', async () => {
    mockProviders[0].type = 'NotAwsCredentialsProvider';
    await expect(widget.getData(mockProviders, mockOverrides)).rejects.toThrow('An AwsCredentialsProvider was expected, but was not given');
  });

});