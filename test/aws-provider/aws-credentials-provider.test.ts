import AWS from "aws-sdk";
import { AwsAssumedRole } from "../../src/aws-provider/aws-credentials/aws-assumed-role";
import { AwsKeys } from "../../src/aws-provider/aws-credentials/aws-keys";
import { LocalAwsProfile } from "../../src/aws-provider/aws-credentials/local-aws-profile";
import { AwsCredentialsProvider } from "../../src/aws-provider/aws-credentials-provider";
import { AwsSdkVersionEnum } from "../../src/aws-provider/aws-credentials/aws-credentials-type";
import { AwsCredentialIdentity } from "@aws-sdk/types";

jest.useFakeTimers().setSystemTime(new Date('2023-02-02').getTime());

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
const mockAwsAssumedRole = new AwsAssumedRole({
  roleArn: 'test-role-arn',
  sessionName: 'test-session-name',
  region: 'test-region',
  primaryCredentials: new LocalAwsProfile({
    profileName: 'default'
  })
});
const mockAwsKeys = new AwsKeys({
  AwsAccessKeyId: 'test-access-key',
  AwsSecretAccessKey: 'test-secret-key',
  AwsSessionToken: 'test-session-token'
});
const mockLocalAwsProfile = new LocalAwsProfile({
  profileName: 'default'
});

describe('getCredentials', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('AwsAssumedRole, v2 sdk', async () => {
    const awsAssumedRole = new AwsAssumedRole({
      roleArn: 'test-role-arn',
      sessionName: 'test-session-name',
      region: 'us-east-1',
      primaryCredentials: new LocalAwsProfile({
        profileName: 'default'
      })
    });
    const spy = jest.spyOn(awsAssumedRole, 'getCredentials').mockImplementation(() => { 
      return new Promise((resolve) => resolve(mockV2Credentials));
    });

    const awsCredentialsProvider = new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: awsAssumedRole
    });
    const result = await awsCredentialsProvider.getCredentials(AwsSdkVersionEnum.V2);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(AwsSdkVersionEnum.V2);
    expect(result).toEqual(mockV2Credentials);
  });
  it('AwsAssumedRole v3 sdk', async () => {
    const awsAssumedRole = new AwsAssumedRole({
      roleArn: 'test-role-arn',
      sessionName: 'test-session-name',
      region: 'us-east-1',
      primaryCredentials: new LocalAwsProfile({
        profileName: 'default'
      })
    });
    const spy = jest.spyOn(awsAssumedRole, 'getCredentials').mockImplementation(() => { 
      return new Promise((resolve) => resolve(mockV3Credentials));
    });

    const awsCredentialsProvider = new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: awsAssumedRole
    });
    const result = await awsCredentialsProvider.getCredentials(AwsSdkVersionEnum.V3);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(AwsSdkVersionEnum.V3);
    expect(result).toEqual(mockV3Credentials);
  });
  it('AwsAssumedRole, no args, defaults to v2 sdk', async () => {
    const awsAssumedRole = new AwsAssumedRole({
      roleArn: 'test-role-arn',
      sessionName: 'test-session-name',
      region: 'us-east-1',
      primaryCredentials: new LocalAwsProfile({
        profileName: 'default'
      })
    });
    const spy = jest.spyOn(awsAssumedRole, 'getCredentials').mockImplementation(() => { 
      return new Promise((resolve) => resolve(mockV2Credentials));
    });

    const awsCredentialsProvider = new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: awsAssumedRole
    });
    const result = await awsCredentialsProvider.getCredentials();
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(AwsSdkVersionEnum.V2);
    expect(result).toEqual(mockV2Credentials);
  });
  it('AwsKeys, v2 sdk', async () => {
    const awsKeys = new AwsKeys({
      AwsAccessKeyId: 'test-access-key',
      AwsSecretAccessKey: 'test-secret-key',
      AwsSessionToken: 'test-session-token'
    });
    const spy = jest.spyOn(awsKeys, 'getCredentials').mockImplementation(() => { 
      return new Promise((resolve) => resolve(mockV2Credentials));
    });

    const awsCredentialsProvider = new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: awsKeys
    });
    const result = await awsCredentialsProvider.getCredentials(AwsSdkVersionEnum.V2);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(AwsSdkVersionEnum.V2);
    expect(result).toEqual(mockV2Credentials);
  });
  it('AwsKeys v3 sdk', async () => {
    const awsKeys = new AwsKeys({
      AwsAccessKeyId: 'test-access-key',
      AwsSecretAccessKey: 'test-secret-key',
      AwsSessionToken: 'test-session-token'
    });
    const spy = jest.spyOn(awsKeys, 'getCredentials').mockImplementation(() => { 
      return new Promise((resolve) => resolve(mockV3Credentials));
    });

    const awsCredentialsProvider = new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: awsKeys
    });
    const result = await awsCredentialsProvider.getCredentials(AwsSdkVersionEnum.V3);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(AwsSdkVersionEnum.V3);
    expect(result).toEqual(mockV3Credentials);
  });
  it('AwsKeys, no args, defaults to v2 sdk', async () => {
    const awsKeys = new AwsKeys({
      AwsAccessKeyId: 'test-access-key',
      AwsSecretAccessKey: 'test-secret-key',
      AwsSessionToken: 'test-session-token'
    });
    const spy = jest.spyOn(awsKeys, 'getCredentials').mockImplementation(() => { 
      return new Promise((resolve) => resolve(mockV2Credentials));
    });

    const awsCredentialsProvider = new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: awsKeys
    });
    const result = await awsCredentialsProvider.getCredentials();
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(AwsSdkVersionEnum.V2);
    expect(result).toEqual(mockV2Credentials);
  });
  it('LocalAwsProfile, v2 sdk', async () => {
    const localAwsProfile = new LocalAwsProfile({
      profileName: 'default'
    });
    const spy = jest.spyOn(localAwsProfile, 'getCredentials').mockImplementation(() => { 
      return new Promise((resolve) => resolve(mockV2Credentials));
    });

    const awsCredentialsProvider = new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: localAwsProfile
    });
    const result = await awsCredentialsProvider.getCredentials(AwsSdkVersionEnum.V2);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(AwsSdkVersionEnum.V2);
    expect(result).toEqual(mockV2Credentials);
  });
  it('LocalAwsProfile v3 sdk', async () => {
    const localAwsProfile = new LocalAwsProfile({
      profileName: 'default'
    });
    const spy = jest.spyOn(localAwsProfile, 'getCredentials').mockImplementation(() => { 
      return new Promise((resolve) => resolve(mockV3Credentials));
    });

    const awsCredentialsProvider = new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: localAwsProfile
    });
    const result = await awsCredentialsProvider.getCredentials(AwsSdkVersionEnum.V3);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(AwsSdkVersionEnum.V3);
    expect(result).toEqual(mockV3Credentials);
  });
  it('LocalAwsProfile, no args, defaults to v2 sdk', async () => {
    const localAwsProfile = new LocalAwsProfile({
      profileName: 'default'
    });
    const spy = jest.spyOn(localAwsProfile, 'getCredentials').mockImplementation(() => { 
      return new Promise((resolve) => resolve(mockV2Credentials));
    });

    const awsCredentialsProvider = new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: localAwsProfile
    });
    const result = await awsCredentialsProvider.getCredentials();
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(AwsSdkVersionEnum.V2);
    expect(result).toEqual(mockV2Credentials);
  });
});

describe('fromJSON', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('has AwsAssumedRole credentials', () => {
    const mockFromJSONArgs = {
      type: 'AwsCredentialsProvider',
      credentials: {
        roleArn: 'test-role-arn',
        sessionName: 'test-session-name',
        region: 'test-region',
        primaryCredentials: {
          profileName: 'default'
        }
      }
    }
    const spy = jest.spyOn(AwsAssumedRole, 'fromJSON').mockImplementation(() => mockAwsAssumedRole);

    const result = AwsCredentialsProvider.fromJSON(mockFromJSONArgs);
    expect(spy).toBeCalled();
    expect(result).toEqual(new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: mockAwsAssumedRole
    }));
  });
  it('has AwsKeys credentials', () => {
    const mockFromJSONArgs = {
      type: 'AwsCredentialsProvider',
      credentials: {
        AwsAccessKeyId: 'test-access-key',
        AwsSecretAccessKey: 'test-secret-key',
        AwsSessionToken: 'test-session-token'
      }
    };
    const spy = jest.spyOn(AwsKeys, 'fromJSON').mockImplementation(() => mockAwsKeys);

    const result = AwsCredentialsProvider.fromJSON(mockFromJSONArgs);
    expect(spy).toBeCalled();
    expect(result).toEqual(new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: mockAwsKeys
    }));
  });
  it('has LocalAwsProfile credentials', () => {
    const mockFromJSONArgs = {
      type: 'AwsCredentialsProvider',
      credentials: {
        profileName: 'default'
      }
    };
    const spy = jest.spyOn(LocalAwsProfile, 'fromJSON').mockImplementation(() => mockLocalAwsProfile);

    const result = AwsCredentialsProvider.fromJSON(mockFromJSONArgs);
    expect(spy).toBeCalled();
    expect(result).toEqual(new AwsCredentialsProvider({
      type: 'AwsCredentialsProvider',
      credentials: mockLocalAwsProfile
    }));
  })
});