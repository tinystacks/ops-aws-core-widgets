import { cleanup } from '@testing-library/react';
import { AwsEcsDeployments } from '../../src/aws-widgets/aws-ecs-deployments.js'

describe('AwsEcsDeployments', () => {
  afterEach(cleanup);
  
  describe('AwsEcsDeployments intialization', () => {
    it('AwsEcsDeployments is initialized successfully', () => {
      const props = {
        id: 'MockWidget',
        type: 'AwsEcsDeployments',
        displayName: 'mock widget', 
        region: 'us-east-1', 
        clusterName: 'cluster-name',
        serviceName: 'service-name'
      };
      
      const awsEcs = AwsEcsDeployments.fromJson(props);
      expect(awsEcs.toJson()).toStrictEqual({
        ...props,
        deployments: [],
        childrenIds: undefined,
        description: undefined,
        displayOptions: undefined,
        providerIds: undefined, 
      });
    });

  });

});


describe('AwsEcsDeployments getData function', () => {
  let mockProviders;
  let mockOverrides;
  let widget;

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
    widget = new AwsEcsDeployments({
      id: 'MockWidget',
      type: 'AwsEcsDeployments',
      displayName: 'mock cw widget', 
      region: 'us-east-1', 
      clusterName: 'cluster-name',
      serviceName: 'service-name'
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw an error if providers is not an array or is empty', async () => {
    await expect(widget.getData(null, mockOverrides)).rejects.toThrow('No AwsCredentialsProvider provided');
    await expect(widget.getData([], mockOverrides)).rejects.toThrow('No AwsCredentialsProvider provided');
  });

  it('should throw an error if the first provider is not an AwsCredentialsProvider', async () => {
    mockProviders[0].type = 'NotAwsCredentialsProvider';
    await expect(widget.getData(mockProviders, mockOverrides)).rejects.toThrow('The passed in provider test-provider is not an AwsCredentialsProvider');
  });

});