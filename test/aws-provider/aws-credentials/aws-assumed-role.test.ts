
import AWS from 'aws-sdk';
import { AwsAssumedRole } from '../../../src/aws-provider/aws-credentials/aws-assumed-role.js';
import { AwsKeys } from '../../../src/aws-provider/aws-credentials/aws-keys.js';
import { LocalAwsProfile } from '../../../src/aws-provider/aws-credentials/local-aws-profile.js';
import { AwsSdkVersionEnum } from '../../../src/aws-provider/aws-credentials/aws-credentials-type.js';
import { AwsCredentialIdentity } from '@aws-sdk/types';

const mockAssumeRole = jest.fn();

jest.mock('@aws-sdk/client-sts', () => ({
    STS: jest.fn().mockImplementation(() => ({
      assumeRole: mockAssumeRole
    }))
}));

jest.useFakeTimers().setSystemTime(new Date('2023-02-02 00:00:00').getTime());

const ROLE_SESSION_DURATION_SECONDS = 3600;

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

describe('AwsAssumedRole', () => {
  afterEach(() => {
    mockAssumeRole.mockClear();
  });

  describe('primary credentials modality', () => {  
      it('AwsAssumedRoleType is initialized successfully', () => {
        const props =  {
          roleArn: 'test-role-arn',
          sessionName: 'test-session-name',
          region: 'test-region',
          primaryCredentials: new AwsAssumedRole({
            roleArn: 'test-primary-role-arn',
            sessionName: 'test-primary-session-name',
            region: 'test-primary-region',
            primaryCredentials: new LocalAwsProfile({
              profileName: 'default'
            })
          })
        };
        
        const awsAssumeRole = AwsAssumedRole.fromJson(props);
        expect(awsAssumeRole).toEqual({
          ...props,
          duration: 3600,
        });
      });

    it('has AwsAssumedRoleType primary credentials', () => {
      const mockfromJsonArgs = {
        roleArn: 'test-role-arn',
        sessionName: 'test-session-name',
        region: 'test-region',
        primaryCredentials: new AwsAssumedRole({
          roleArn: 'test-primary-role-arn',
          sessionName: 'test-primary-session-name',
          region: 'test-primary-region',
          primaryCredentials: new LocalAwsProfile({
            profileName: 'default'
          })
        })
      };
  
      const mockfromJsonResult = new AwsAssumedRole(mockfromJsonArgs);
  
      const result = new AwsAssumedRole(mockfromJsonArgs);
      expect(result).toEqual(mockfromJsonResult);
    });
  
    it('has AwsKeys primary credentials', () => {
      const mockfromJsonArgs = {
        roleArn: 'test-role-arn',
        sessionName: 'test-session-name',
        region: 'test-region',
        primaryCredentials: new AwsKeys({
          AwsAccessKeyId: 'test-access-key',
          AwsSecretAccessKey: 'test-secret-key',
          AwsSessionToken: 'test-session-token'
        })
      };
  
      const mockfromJsonResult = new AwsAssumedRole(mockfromJsonArgs);
  
      const result = new AwsAssumedRole(mockfromJsonArgs);
      expect(result).toEqual(mockfromJsonResult);
    });
  
    it('has LocalAwsProfile primary credentials', () => {
      const mockfromJsonArgs = {
        roleArn: 'test-role-arn',
        sessionName: 'test-session-name',
        region: 'test-region',
        primaryCredentials: new LocalAwsProfile({
          profileName: 'default'
        })
      };
  
      const mockfromJsonResult = new AwsAssumedRole(mockfromJsonArgs);
  
      const result = new AwsAssumedRole(mockfromJsonArgs);
      expect(result).toEqual(mockfromJsonResult);
    });
  });
  
  describe('getCredentials', () => {
    it('sts creds have expired, v2 sdk', async () => {
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
        primaryCredentials: new LocalAwsProfile({
          profileName: 'default'
        })
      });
  
      const result = await awsAssumedRole.getCredentials(AwsSdkVersionEnum.V2);
      expect(mockAssumeRole).toBeCalledTimes(1);
      expect(mockAssumeRole).toBeCalledWith({
        RoleArn: 'test-role-arn',
        RoleSessionName: 'test-session-name',
        DurationSeconds: ROLE_SESSION_DURATION_SECONDS
      });
      expect(result).toEqual(mockV2Credentials);
    });
    it('sts creds have expired, v3 sdk', async () => {
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
        primaryCredentials: new LocalAwsProfile({
          profileName: 'default'
        })
      });
  
      const result = await awsAssumedRole.getCredentials(AwsSdkVersionEnum.V3);
      expect(mockAssumeRole).toBeCalledTimes(1);
      expect(mockAssumeRole).toBeCalledWith({
        RoleArn: 'test-role-arn',
        RoleSessionName: 'test-session-name',
        DurationSeconds: ROLE_SESSION_DURATION_SECONDS
      });
      expect(result).toEqual(mockV3Credentials);
    });
    it('sts creds have expired, no args, defaults to v3 sdk', async () => {
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
        primaryCredentials: new LocalAwsProfile({
          profileName: 'default'
        })
      });
  
      const result = await awsAssumedRole.getCredentials();
      expect(mockAssumeRole).toBeCalledTimes(1);
      expect(mockAssumeRole).toBeCalledWith({
        RoleArn: 'test-role-arn',
        RoleSessionName: 'test-session-name',
        DurationSeconds: ROLE_SESSION_DURATION_SECONDS
      });
      expect(result).toEqual(mockV3Credentials);
    });
    it('sts creds have not expired, v2 sdk', async () => {
      mockAssumeRole.mockResolvedValueOnce({
        Credentials: {
          AccessKeyId: 'test-access-key',
          SecretAccessKey: 'test-secret-key',
          SessionToken: 'test-session-token',
          Expiration: new Date('2023-02-02 01:30:00')
        }
      });
  
      const awsAssumedRole = new AwsAssumedRole({
        roleArn: 'test-role-arn',
        sessionName: 'test-session-name',
        region: 'us-east-1',
        primaryCredentials: new LocalAwsProfile({
          profileName: 'default'
        })
      });
      // initial call (for caching)
      await awsAssumedRole.getCredentials(AwsSdkVersionEnum.V2);
      const result = await awsAssumedRole.getCredentials(AwsSdkVersionEnum.V2);
      // mockAssumeRole only called once during initial call
      expect(mockAssumeRole).toBeCalledTimes(1);
      expect(result).toEqual(mockV2Credentials);
    });
    it('sts creds have not expired, v3 sdk', async () => {
      mockAssumeRole.mockResolvedValueOnce({
        Credentials: {
          AccessKeyId: 'test-access-key',
          SecretAccessKey: 'test-secret-key',
          SessionToken: 'test-session-token',
          Expiration: new Date('2023-02-02 01:30:00')
        }
      });
  
      const awsAssumedRole = new AwsAssumedRole({
        roleArn: 'test-role-arn',
        sessionName: 'test-session-name',
        region: 'us-east-1',
        primaryCredentials: new LocalAwsProfile({
          profileName: 'default'
        })
      });
      // initial call (for caching)
      await awsAssumedRole.getCredentials(AwsSdkVersionEnum.V3);
      const result = await awsAssumedRole.getCredentials(AwsSdkVersionEnum.V3);
      // mockAssumeRole only called once during initial call
      expect(mockAssumeRole).toBeCalledTimes(1);
      expect(result).toEqual(mockV3Credentials);
    });
    it('sts creds have not expired, no args, defaults to v3 sdk', async () => {
      mockAssumeRole.mockResolvedValueOnce({
        Credentials: {
          AccessKeyId: 'test-access-key',
          SecretAccessKey: 'test-secret-key',
          SessionToken: 'test-session-token',
          Expiration: new Date('2023-02-02 01:30:00')
        }
      });
  
      const awsAssumedRole = new AwsAssumedRole({
        roleArn: 'test-role-arn',
        sessionName: 'test-session-name',
        region: 'us-east-1',
        primaryCredentials: new LocalAwsProfile({
          profileName: 'default'
        })
      });
      // initial call (for caching)
      await awsAssumedRole.getCredentials();
      const result = await awsAssumedRole.getCredentials();
      // mockAssumeRole only called once during initial call
      expect(mockAssumeRole).toBeCalledTimes(1);
      expect(result).toEqual(mockV3Credentials);
    });
  });
});
