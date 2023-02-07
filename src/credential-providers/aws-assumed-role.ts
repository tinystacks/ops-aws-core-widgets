import AWS from 'aws-sdk';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { AwsCredentialsType, AwsSdkVersionEnum, getVersionedCredentials } from '../credential-types/aws-credentials-type';
import { AwsAssumedRole as AwsAssumedRoleType } from '@tinystacks/ops-model';
import AwsKeys from './aws-keys';
import LocalAwsProfile from './local-aws-profile';

const ROLE_SESSION_DURATION_SECONDS = 3600;
const DEFAULT_REGION = 'us-east-1';

class AwsAssumedRole implements AwsAssumedRoleType, AwsCredentialsType {
  roleArn: string;
  sessionName: string;
  region: string;
  duration?: number;
  primaryCredentials: AwsAssumedRole | AwsKeys | LocalAwsProfile;
  private stsClient: AWS.STS;
  private stsCreds: AWS.STS.Credentials;

  constructor (args: {
    roleArn: string,
    sessionName: string,
    region: string,
    primaryCredentials: AwsAssumedRole | AwsKeys | LocalAwsProfile;
    duration?: number
  }) {
    const {
      roleArn,
      sessionName,
      region,
      duration,
      primaryCredentials
    } = args;
    this.roleArn = roleArn;
    this.sessionName = sessionName;
    this.region = region || DEFAULT_REGION;
    this.primaryCredentials = primaryCredentials;
    this.duration = duration || ROLE_SESSION_DURATION_SECONDS;
  }

  static fromObject (object: AwsAssumedRole): AwsAssumedRole {
    const {
      roleArn,
      sessionName,
      region,
      primaryCredentials,
      duration
    } = object;
    return new AwsAssumedRole({
      roleArn,
      sessionName,
      region,
      primaryCredentials,
      duration
    });
  }

  private credsWillExpireInSession () {
    const credsExist = !!this.stsCreds;
    if (!credsExist) {
      return true;
    }
    // TODO: simplify the statements below
    const timeSinceCredsWereSet = this.stsCreds.Expiration.getTime() - new Date().getTime();
    const serviceCredsWillExpireInSession = timeSinceCredsWereSet < this.duration * 1000;
    return serviceCredsWillExpireInSession;
  }

  private mapStsCredsToGenericCreds() {
    if (!this.stsCreds) {
      throw new Error('STS creds do not exist!');
    }
    return {
      accessKeyId: this.stsCreds.AccessKeyId,
      secretAccessKey: this.stsCreds.SecretAccessKey,
      sessionToken: this.stsCreds.SessionToken
    };
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V2) {
    // if sts creds exist and have not expired, return them as generic creds
    if (!this.credsWillExpireInSession()) {
      const genericCreds = this.mapStsCredsToGenericCreds();
      return genericCreds;
    }
    const creds = await this.primaryCredentials.getCredentials(awsSdkVersion);
    this.stsClient = new AWS.STS({
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
      sessionToken: creds.sessionToken,
      region: this.region
    });
    
    const res = await this.stsClient.assumeRole({
      RoleArn: this.roleArn,
      RoleSessionName: this.sessionName,
      DurationSeconds: this.duration
    }).promise();
    this.stsCreds = res.Credentials;
    const genericCreds = this.mapStsCredsToGenericCreds();
    return getVersionedCredentials(awsSdkVersion, genericCreds);
  }

  // async getV3Credentials () {
  //   let creds: AwsCredentialIdentityProvider;
  //   try {
  //     if (this.primaryCredentials) {
  //       creds = (this.primaryCredentials as AwsCredentialsType).getV3Credentials();
  //     }
  //   } catch (error) {
  //     throw new Error('Failed to get V3 credentials for the provided primaryCredentials. V3 credentials are not supported by all credential types');
  //   }
   
  //   return fromTemporaryCredentials({
  //     params: {
  //       RoleArn: this.roleArn,
  //       RoleSessionName: this.sessionName,
  //       DurationSeconds: this.duration
  //     },
  //     clientConfig: {
  //       region: this.region
  //     },
  //     ...(creds && { masterCredentials: creds })
  //   });
  // }
}

export default AwsAssumedRole;