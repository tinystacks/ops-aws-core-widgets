const mockSharedIniFileCredentials = jest.fn();

import { fromIni } from "@aws-sdk/credential-providers";
import AWS from "aws-sdk";
import LocalAwsProfile from "../../src/credential-providers/local-aws-profile";

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

const mockV3Credentials = fromIni({
  profile: 'default'
});

describe('getV2Credentials', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('creates credentials', async () => {
    mockSharedIniFileCredentials.mockReturnValue(mockV2Credentials);

    const localAwsProfile = new LocalAwsProfile('default');
    const result = await localAwsProfile.getV2Credentials();
    expect(result).toEqual(mockV2Credentials);
  });
});

describe('getV3Credentials', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('creates credential identity provider', async () => {
    const localAwsProfile = new LocalAwsProfile('default');
    const result = localAwsProfile.getV3Credentials();
    expect(result.toString()).toBe(mockV3Credentials.toString());
  });
});