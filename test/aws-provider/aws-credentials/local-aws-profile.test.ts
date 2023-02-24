const mockSharedIniFileCredentials = jest.fn();

import { AwsCredentialIdentity } from "@aws-sdk/types";
import AWS from "aws-sdk";
import { AwsSdkVersionEnum } from "../../../src/aws-provider/aws-credentials/aws-credentials-type";
import { LocalAwsProfile } from "../../../src/aws-provider/aws-credentials/local-aws-profile";

jest.mock('aws-sdk', () => {
  const original = jest.requireActual('aws-sdk');
  return {
    ...original,
    SharedIniFileCredentials: mockSharedIniFileCredentials
  }
});

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

describe('fromJson', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('creates LocalAwsProfile object', () => {
    const mockfromJsonArgs = {
      profileName: 'default'
    };
    const mockfromJsonResult = new LocalAwsProfile({
      profileName: 'default'
    });

    const result = LocalAwsProfile.fromJson(mockfromJsonArgs);
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

  it('reads profile successfully, v2 sdk', async () => {
    mockSharedIniFileCredentials.mockReturnValue(new AWS.Credentials({
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      sessionToken: 'test-session-token'
    }));

    const localAwsProfile = new LocalAwsProfile({
      profileName: 'default'
    });
    const result = await localAwsProfile.getCredentials(AwsSdkVersionEnum.V2);
    expect(result).toEqual(mockV2Credentials);
  });
  it('reads profile successfully, v3 sdk', async () => {
    mockSharedIniFileCredentials.mockReturnValue(new AWS.Credentials({
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      sessionToken: 'test-session-token'
    }));

    const localAwsProfile = new LocalAwsProfile({
      profileName: 'default'
    });
    const result = await localAwsProfile.getCredentials(AwsSdkVersionEnum.V3);
    expect(result).toEqual(mockV3Credentials);
  });
  it('reads profile successfully, no args, defaults to v3 sdk', async () => {
    mockSharedIniFileCredentials.mockReturnValue(new AWS.Credentials({
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      sessionToken: 'test-session-token'
    }));

    const localAwsProfile = new LocalAwsProfile({
      profileName: 'default'
    });
    const result = await localAwsProfile.getCredentials();
    expect(result).toEqual(mockV3Credentials);
  });
  it('reads profile unsuccessfully', async () => {
    mockSharedIniFileCredentials.mockImplementationOnce(() => {
      throw new Error();
    });

    const localAwsProfile = new LocalAwsProfile({
      profileName: 'default'
    });

    let thrownError;
    try {
      await localAwsProfile.getCredentials(AwsSdkVersionEnum.V2);
    } catch (e) {
      thrownError = e
    } finally {
      expect(thrownError).toBeDefined();
      expect(thrownError).toEqual(new Error('Failed to read credentials from profile: default!. Ensure default exists in ~/.aws/credentials'));
    }
  });
});