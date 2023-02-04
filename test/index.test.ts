const mockAssumeRole = jest.fn();
const mockSharedIniFileCredentials = jest.fn();

import { fromIni, fromTemporaryCredentials } from "@aws-sdk/credential-providers";
import AWS from "aws-sdk";
import AwsAssumedRole from "../src/credential-providers/aws-assumed-role";
import AwsKeys from "../src/credential-providers/aws-keys";
import LocalAwsProfile from "../src/credential-providers/local-aws-profile";
import AwsCredentialsProvider from "../src/index";

jest.useFakeTimers().setSystemTime(new Date('2023-02-02').getTime());

jest.mock('aws-sdk', () => {
  const original = jest.requireActual('aws-sdk');
  return {
    ...original,
    STS: jest.fn(() => {
      return {
        assumeRole: (...args) => ({
          promise: () => mockAssumeRole(...args)
        })
      }
    }),
    SharedIniFileCredentials: mockSharedIniFileCredentials
  }
});

const ROLE_SESSION_DURATION_SECONDS = 3600;

const mockAssumedRoleV2Credentials = new AWS.Credentials({
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
});
const mockAssumedRoleV3Credentials = fromTemporaryCredentials({
  params: {
    RoleArn: 'test-role-arn',
    RoleSessionName: 'test-session-name',
  },
  clientConfig: { region: 'us-east-1' }
});

const mockAwsKeysV2Credentials = new AWS.Credentials({
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
});

const mockLocalAwsProfileV2Credentials = new AWS.Credentials({
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
});

const mockLocalAwsProfileV3Credentials = fromIni({
  profile: 'default'
});

describe('AwsAssumedRole Credentials', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('uses V2 credentials', async () => {
    mockAssumeRole.mockResolvedValueOnce({
      Credentials: {
        AccessKeyId: 'test-primary-access-key',
        SecretAccessKey: 'test-primary-secret-key',
        SessionToken: 'test-primary-session-token'
      }
    });
    mockAssumeRole.mockResolvedValueOnce({
      Credentials: {
        AccessKeyId: 'test-access-key',
        SecretAccessKey: 'test-secret-key',
        SessionToken: 'test-session-token'
      }
    });

    const awsAssumedRole = new AwsAssumedRole({
      roleArn: 'test-role-arn',
      sessionName: 'test-session-name',
      region: 'us-east-1',
      primaryCredentials: new AwsAssumedRole({
        roleArn: 'test-primary-role-arn',
        sessionName: 'test-primary-session-name',
        region: 'us-east-1'
      })
    });
    const awsCredentialsProvider = new AwsCredentialsProvider('test-provider', awsAssumedRole);
    const result = await awsCredentialsProvider.getV2Credentials();
    expect(mockAssumeRole).toBeCalledTimes(2);
    expect(mockAssumeRole).toBeCalledWith({
      RoleArn: 'test-primary-role-arn',
      RoleSessionName: 'test-primary-session-name',
      DurationSeconds: ROLE_SESSION_DURATION_SECONDS
    });
    expect(mockAssumeRole).toBeCalledWith({
      RoleArn: 'test-role-arn',
      RoleSessionName: 'test-session-name',
      DurationSeconds: ROLE_SESSION_DURATION_SECONDS
    });
    expect(result).toEqual(mockAssumedRoleV2Credentials);
  });

  it('uses V3 credentials', () => {
    const awsAssumedRole = new AwsAssumedRole({
      roleArn: 'test-role-arn',
      sessionName: 'test-session-name',
      region: 'us-east-1',
      primaryCredentials: new AwsAssumedRole({
        roleArn: 'test-primary-role-arn',
        sessionName: 'test-primary-session-name',
        region: 'us-east-1'
      })
    });
    const awsCredentialsProvider = new AwsCredentialsProvider('test-provider', awsAssumedRole);

    const result = awsCredentialsProvider.getV3Credentials();
    expect(result.toString()).toEqual(mockAssumedRoleV3Credentials.toString());
  });
});

describe('AwsKeys Credentials', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('uses V2 credentials', async () => {
    const awsKeys = new AwsKeys('test-access-key', 'test-secret-key', 'test-session-token');
    const awsCredentialsProvider = new AwsCredentialsProvider('test-provider', awsKeys);
    const result = await awsCredentialsProvider.getV2Credentials();
    expect(result).toEqual(mockAwsKeysV2Credentials);
  });
});

describe('LocalAwsProfile Credentials', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('uses V2 credentials', async () => {
    mockSharedIniFileCredentials.mockReturnValue(mockLocalAwsProfileV2Credentials);

    const localAwsProfile = new LocalAwsProfile('default');
    const awsCredentialsProvider = new AwsCredentialsProvider('test-provider', localAwsProfile);
    const result = await awsCredentialsProvider.getV2Credentials();
    expect(result).toEqual(mockLocalAwsProfileV2Credentials);
  });
  it('uses V3 credentials', async () => {
    const localAwsProfile = new LocalAwsProfile('default');
    const awsCredentialsProvider = new AwsCredentialsProvider('test-provider', localAwsProfile);
    const result = awsCredentialsProvider.getV3Credentials();
    expect(result.toString()).toBe(mockLocalAwsProfileV3Credentials.toString());
  });
});