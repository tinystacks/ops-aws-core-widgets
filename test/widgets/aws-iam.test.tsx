import { cleanup } from '@testing-library/react';
import { AwsIamJson } from '../../src/controllers/aws-iam-json.js'

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

  it('should throw an error if providers is nil', async () => {
    let thrownError;
    try {
      await widget.getData(null, mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('An AwsCredentialsProvider was expected, but was not given');
    }
  });
  it('should throw an error if providers is an empty array', async () => {
    let thrownError;
    try {
      await widget.getData([], mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('An AwsCredentialsProvider was expected, but was not given');
    }
  });
  it('should throw an error if the first provider is not an AwsCredentialsProvider', async () => {
    let thrownError;
    try {
      await widget.getData([{ type: 'Not-AwsCredentialsProvider' }, mockProviders], mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('An AwsCredentialsProvider was expected, but was not given');
    }
  });
});