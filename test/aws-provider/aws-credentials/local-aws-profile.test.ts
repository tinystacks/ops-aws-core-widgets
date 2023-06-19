const mockfromSSO = jest.fn();
const mockFromIni = jest.fn();
const mockSharedIniFileCredentials = jest.fn();
const mockCredentials = jest.fn();

jest.mock('@aws-sdk/credential-provider-ini', () => ({ fromIni: jest.fn(() => mockFromIni)
}));

jest.mock('@aws-sdk/credential-provider-sso', () => ({
  fromSSO: jest.fn(() => mockfromSSO)
}));

jest.mock('aws-sdk', () => ({
  SharedIniFileCredentials: mockSharedIniFileCredentials,
  Credentials: mockCredentials
}));

import { AwsSdkVersionEnum } from "../../../src/aws-provider/aws-credentials/aws-credentials-type.js";
import { LocalAwsProfile } from "../../../src/aws-provider/aws-credentials/local-aws-profile";

const mockV2Credentials = {
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
};

describe('fromJson', () => {
  beforeEach(() => {
    jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
  });
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
  beforeEach(() => {
    mockSharedIniFileCredentials.mockReturnValue(mockV2Credentials);
    mockCredentials.mockImplementation(creds => creds);
  });
  it('reads profile successfully, v2 sdk', async () => {
    const localAwsProfile = new LocalAwsProfile({
      profileName: 'default'
    });
    const result = await localAwsProfile.getCredentials(AwsSdkVersionEnum.V2);
    expect(result).toEqual(mockV2Credentials);
  });
  it('reads profile unsuccessfully', async () => {
    mockSharedIniFileCredentials.mockImplementation(() => { throw new Error('error'); });

    const localAwsProfile = new LocalAwsProfile({
      profileName: 'default'
    });

    let thrownError: any;
    try {
      await localAwsProfile.getCredentials(AwsSdkVersionEnum.V2);
    } catch (e) {
      thrownError = e
    } finally {
      expect(thrownError).toBeDefined();
      expect(thrownError.message).toEqual('Failed to read credentials from profile: default!. Ensure default exists in ~/.aws/credentials');
    }
  });
});