import AWS from "aws-sdk";
import { AwsSdkVersionEnum } from "../../../src/aws-provider/aws-credentials/aws-credentials-type.js";
import { AwsKeys } from "../../../src/aws-provider/aws-credentials/aws-keys.js";

const mockV2Credentials = new AWS.Credentials({
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
});
const mockV3Credentials = {
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
};

describe('fromJson', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('creates AwsKeys object', async () => {
    const mockfromJsonArgs = {
      AwsAccessKeyId: 'test-access-key',
      AwsSecretAccessKey: 'test-secret-key',
      AwsSessionToken: 'test-session-token'
    };
    const mockfromJsonResult = new AwsKeys({
      AwsAccessKeyId: 'test-access-key',
      AwsSecretAccessKey: 'test-secret-key',
      AwsSessionToken: 'test-session-token'
    });

    const result = new AwsKeys(mockfromJsonArgs);
    expect(result).toEqual(mockfromJsonResult);   
  });
});

describe('getCredentials', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('v2 sdk', async () => {
    const awsKeys = new AwsKeys({
      AwsAccessKeyId: 'test-access-key',
      AwsSecretAccessKey: 'test-secret-key',
      AwsSessionToken: 'test-session-token'
    });

    const result = await awsKeys.getCredentials(AwsSdkVersionEnum.V2);
    expect(result).toEqual(mockV2Credentials);
  });
  it('v3 sdk', async () => {
    const awsKeys = new AwsKeys({
      AwsAccessKeyId: 'test-access-key',
      AwsSecretAccessKey: 'test-secret-key',
      AwsSessionToken: 'test-session-token'
    });

    const result = await awsKeys.getCredentials(AwsSdkVersionEnum.V3);
    expect(result).toEqual(mockV3Credentials);
  });
  it('no args, defaults to v3 sdk', async () => {
    const awsKeys = new AwsKeys({
      AwsAccessKeyId: 'test-access-key',
      AwsSecretAccessKey: 'test-secret-key',
      AwsSessionToken: 'test-session-token'
    });

    const result = await awsKeys.getCredentials();
    expect(result).toEqual(mockV3Credentials);
  });
});