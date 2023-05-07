import { AwsCredentialIdentity } from "@aws-sdk/types";
import AWS from "aws-sdk";
import { AwsSdkVersionEnum } from "../../../src/aws-provider/aws-credentials/aws-credentials-type.js";
import { LocalAwsProfile } from "../../../src/aws-provider/aws-credentials/local-aws-profile";

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

const mockfromSSO = jest.fn();

const mockFromIni = jest.fn();

jest.mock('@aws-sdk/credential-provider-ini', () => ({ fromIni: jest.fn(() => mockFromIni)
}));

jest.mock('@aws-sdk/credential-provider-sso', () => ({
  fromSSO: jest.fn(() => mockfromSSO)
}));

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

    const result = new LocalAwsProfile(mockfromJsonArgs);
    expect(result).toEqual(mockfromJsonResult);
  });
});

describe('getCredentials', () => {
  it('reads profile successfully, v2 sdk', async () => {

    mockfromSSO.mockRejectedValueOnce(new Error('error'));

    mockFromIni.mockReturnValueOnce(new AWS.Credentials({
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
  it('reads profile successfully, v2 sdk twoo', async () => {

    mockfromSSO.mockRejectedValueOnce(new Error('error'));

    mockFromIni.mockReturnValueOnce(new AWS.Credentials({
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

 /*it('reads profile successfully, v3 sdk', async () => {
  mockfromSSO.mockRejectedValue(new Error('error'));

  mockFromIni.mockReturnValue(new AWS.Credentials({
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
    mockfromSSO.mockRejectedValueOnce(new Error('error'));

    mockFromIni.mockReturnValueOnce(new AWS.Credentials({
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
      sessionToken: 'test-session-token'
    }));   

    const localAwsProfile = new LocalAwsProfile({
      profileName: 'default'
    });
    const result = await localAwsProfile.getCredentials();
    expect(result).toEqual(mockV3Credentials);
  });*/
  it('reads profile unsuccessfully', async () => {
    mockfromSSO.mockRejectedValueOnce(new Error('error'));

    mockFromIni.mockRejectedValueOnce(new Error('error'));

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