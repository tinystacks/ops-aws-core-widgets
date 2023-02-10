import { AwsCredentialIdentity } from "@aws-sdk/types";
import AWS from "aws-sdk";
import { AwsSdkVersionEnum } from "../../../src/aws-provider/aws-credentials/aws-credentials-type";
import { AwsKeys } from "../../../src/aws-provider/aws-credentials/aws-keys";

const mockV2Credentials = new AWS.Credentials({
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
});
const mockV3Credentials = {
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
} as AwsCredentialIdentity;

describe('fromJSON', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('creates AwsKeys object', async () => {
    const mockFromJSONArgs = {
      AwsAccessKeyId: 'test-access-key',
      AwsSecretAccessKey: 'test-secret-key',
      AwsSessionToken: 'test-session-token'
    };
    const mockFromJSONResult = new AwsKeys({
      AwsAccessKeyId: 'test-access-key',
      AwsSecretAccessKey: 'test-secret-key',
      AwsSessionToken: 'test-session-token'
    });

    const result = AwsKeys.fromJSON(mockFromJSONArgs);
    expect(result).toEqual(mockFromJSONResult);   
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
  it('no args, defaults to v2 sdk', async () => {
    const awsKeys = new AwsKeys({
      AwsAccessKeyId: 'test-access-key',
      AwsSecretAccessKey: 'test-secret-key',
      AwsSessionToken: 'test-session-token'
    });

    const result = await awsKeys.getCredentials();
    expect(result).toEqual(mockV2Credentials);
  });
});