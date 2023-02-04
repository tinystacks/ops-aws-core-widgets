const mockAssumeRole = jest.fn();

import AWS from 'aws-sdk';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import AwsAssumedRole from '../../src/credential-providers/aws-assumed-role';
import AwsKeys from '../../src/credential-providers/aws-keys';
import LocalAwsProfile from '../../src/credential-providers/local-aws-profile';

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
    })
  }
});

const ROLE_SESSION_DURATION_SECONDS = 3600;

const mockV2Credentials = new AWS.Credentials({
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
});

const mockV3Credentials = fromTemporaryCredentials({
  params: {
    RoleArn: 'test-role-arn',
    RoleSessionName: 'test-session-name',
  },
  clientConfig: { region: 'us-east-1' }
});

describe('getV2Credentials', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });
  it('sts creds have expired and does not have primaryCredentials', async () => {
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
      region: 'us-east-1'
    });

    const result = await awsAssumedRole.getV2Credentials();
    expect(mockAssumeRole).toBeCalledWith({
      RoleArn: 'test-role-arn',
      RoleSessionName: 'test-session-name',
      DurationSeconds: ROLE_SESSION_DURATION_SECONDS
    });
    expect(result).toEqual(mockV2Credentials);
  });
  it('sts creds have expired and has AwsAssumedRole primaryCredentials', async () => {
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

    const result = await awsAssumedRole.getV2Credentials();
    expect(awsAssumedRole.primaryCredentials).toBeInstanceOf(AwsAssumedRole);
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
    expect(result).toEqual(mockV2Credentials);
  });
  it('sts creds have expired and has AwsKeys primaryCredentials', async () => {
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
      primaryCredentials: new AwsKeys('test-primary-access-key', 'test-primary-secret-key', 'test-primary-session-token')
    });

    const result = await awsAssumedRole.getV2Credentials();
    expect(awsAssumedRole.primaryCredentials).toBeInstanceOf(AwsKeys);
    expect(mockAssumeRole).toBeCalledTimes(1);
    expect(mockAssumeRole).toBeCalledWith({
      RoleArn: 'test-role-arn',
      RoleSessionName: 'test-session-name',
      DurationSeconds: ROLE_SESSION_DURATION_SECONDS
    });
    expect(result).toEqual(mockV2Credentials);
  });
  it('sts creds have expired and has LocalAwsProfile primaryCredentials', async () => {
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
      primaryCredentials: new LocalAwsProfile('default')
    });

    const result = await awsAssumedRole.getV2Credentials();
    expect(awsAssumedRole.primaryCredentials).toBeInstanceOf(LocalAwsProfile);
    expect(mockAssumeRole).toBeCalledTimes(1);
    expect(mockAssumeRole).toBeCalledWith({
      RoleArn: 'test-role-arn',
      RoleSessionName: 'test-session-name',
      DurationSeconds: ROLE_SESSION_DURATION_SECONDS
    });
    expect(result).toEqual(mockV2Credentials);
  });
  it('sts creds have expired and has LocalAwsProfile primaryCredentials', async () => {
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
      primaryCredentials: new LocalAwsProfile('default')
    });

    const result = await awsAssumedRole.getV2Credentials();
    expect(awsAssumedRole.primaryCredentials).toBeInstanceOf(LocalAwsProfile);
    expect(mockAssumeRole).toBeCalledTimes(1);
    expect(mockAssumeRole).toBeCalledWith({
      RoleArn: 'test-role-arn',
      RoleSessionName: 'test-session-name',
      DurationSeconds: ROLE_SESSION_DURATION_SECONDS
    });
    expect(result).toEqual(mockV2Credentials);
  });
  it('sts creds have not expired', async () => {
    mockAssumeRole.mockResolvedValueOnce({
      Credentials: {
        AccessKeyId: 'test-access-key',
        SecretAccessKey: 'test-secret-key',
        SessionToken: 'test-session-token',
        Expiration: new Date('2023-02-03')
      }
    });

    const awsAssumedRole = new AwsAssumedRole({
      roleArn: 'test-role-arn',
      sessionName: 'test-session-name',
      region: 'us-east-1',
      duration: 86400,
      primaryCredentials: new LocalAwsProfile('default')
    });

    const result1 = await awsAssumedRole.getV2Credentials();
    const result2 = await awsAssumedRole.getV2Credentials();
    expect(mockAssumeRole).toBeCalledTimes(1);
    expect(mockAssumeRole).toBeCalledWith({
      RoleArn: 'test-role-arn',
      RoleSessionName: 'test-session-name',
      DurationSeconds: 86400
    });
    expect(result1).toEqual(result2);
  });
});

describe('getV3Credentials', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('has AwsAssumedRole primaryCredentials', () => {
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

    const result = awsAssumedRole.getV3Credentials();
    expect(result.toString()).toEqual(mockV3Credentials.toString());
  });
  it('has AwsKeys primaryCredentials', () => {
    const awsAssumedRole = new AwsAssumedRole({
      roleArn: 'test-role-arn',
      sessionName: 'test-session-name',
      region: 'us-east-1',
      primaryCredentials: new AwsKeys('test-access-key', 'test-secret-key', 'test-session-token')
    });

    let thrownError;
    try {
      awsAssumedRole.getV3Credentials();
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError).toBeDefined();
      expect(thrownError.message).toBe('Failed to get V3 credentials for the provided primaryCredentials. V3 credentials are not supported by all credential types');
    }
  });
  it('has LocalAwsProfile primaryCredentials', () => {
    const awsAssumedRole = new AwsAssumedRole({
      roleArn: 'test-role-arn',
      sessionName: 'test-session-name',
      region: 'us-east-1',
      primaryCredentials: new LocalAwsProfile('default')
    });

    const result = awsAssumedRole.getV3Credentials();
    expect(result.toString()).toEqual(mockV3Credentials.toString());
  });
});