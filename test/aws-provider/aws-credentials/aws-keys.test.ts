import { jest } from '@jest/globals';
const mockSharedIniFileCredentials = jest.fn();
const mockCredentials = jest.fn();
const mockAws = {
  SharedIniFileCredentials: mockSharedIniFileCredentials,
  Credentials: mockCredentials
};

jest.mock('aws-sdk', () => ({
  __esModule: true,
  ...mockAws
}));

const { AwsSdkVersionEnum } = await import("../../../src/aws-provider/aws-credentials/aws-credentials-type.js");
const { AwsKeys } = await import("../../../src/aws-provider/aws-credentials/aws-keys.js");

const mockV2Credentials = {
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
};
const mockV3Credentials = {
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
};

describe('AwsKeys', () => {
  beforeEach(() => {
    jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
    mockSharedIniFileCredentials.mockReturnValue(mockV2Credentials);
    mockCredentials.mockImplementation(creds => creds);
  });
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });
  describe('fromJson', () => {
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
});