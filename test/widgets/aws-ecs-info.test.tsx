import { cleanup } from '@testing-library/react';
import { AwsEcsInfo } from '../../src/aws-widgets/aws-ecs-info.js'

describe('AwsEcsInfo', () => {
  afterEach(cleanup);
  
  describe('AwsEcsInfo intialization', () => {
    it('AwsEcsInfo is initialized successfully', () => {
      const props = {
        id: 'MockWidget',
        type: 'AwsEcsInfo',
        displayName: 'mock cw widget', 
        region: 'us-east-1', 
        clusterName: 'cluster-name',
        serviceName: 'service-name'
      };
      
      const awsEcsInfo = new AwsEcsInfo(props);
      expect(awsEcsInfo.toJson()).toStrictEqual({
        ...props,
        childrenIds: undefined,
        description: undefined,
        displayOptions: undefined,
        providerIds: undefined, 
        serviceArn: undefined,
        clusterArn: undefined,
        runningCount: undefined,
        desiredCount: undefined,
        capacity: undefined,
        asgArn: undefined,
        memory: undefined,
        cpu: undefined,
        taskDefinitionArn: undefined,
        status: undefined,
        roleArn: undefined,
        execRoleArn: undefined,
        images: undefined, 
        capacityType: undefined
      });
    });

  });

});


describe('AwsEcsInfo getData function', () => {
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
    widget = new AwsEcsInfo({
      id: 'MockWidget',
      type: 'AwsEcsInfo',
      displayName: 'mock widget', 
      region: 'us-east-1', 
      clusterName: 'cluster-name',
      serviceName: 'service-name', 
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
