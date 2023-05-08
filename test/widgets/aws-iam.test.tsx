import { cleanup } from '@testing-library/react';
import { AwsIamJson } from '../../src/aws-widgets/aws-iam-json.js'
import { IAM } from '@aws-sdk/client-iam';

describe('AwsIamJson', () => {
  afterEach(cleanup);
  
  describe('AwsIamJson intialization', () => {
    it('AwsIamJson is initialized successfully', () => {
      const props = {
        id: 'MockWidget',
        type: 'AwsIamJson',
        displayName: 'mock widget', 
        region: 'us-east-1', 
        policyArn: 'policy-arn'
      };
      
      const iamJson = AwsIamJson.fromJson(props);
      expect(iamJson.toJson()).toStrictEqual({
        ...props,
        roleArn: undefined,
        childrenIds: undefined,
        description: undefined,
        displayOptions: undefined,
        providerIds: undefined, 
      });
    });

  });

});

describe('AwsIamJson getData function', () => {
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
    widget = new AwsIamJson({
      id: 'MockWidget',
      type: 'AwsIamJson',
      displayName: 'mock cw widget', 
      region: 'us-east-1', 
      policyArn: 'policy-arn'
    });
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