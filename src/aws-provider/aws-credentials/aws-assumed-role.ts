import { STS, Credentials } from '@aws-sdk/client-sts';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type.js';
import { AwsKeys, AwsKeysConfig } from './aws-keys.js';
import { LocalAwsProfile, LocalAwsProfileConfig } from './local-aws-profile.js';
import { AwsCredentialsClass, AwsCredentialsConfig } from '../../types/types.js';

const ROLE_SESSION_DURATION_SECONDS = 3600;
const DEFAULT_REGION = 'us-east-1';

export type AwsAssumedRoleConfig = { 
  roleArn: string;
  sessionName: string;
  region: string;
  primaryCredentials: AwsCredentialsClass;
  duration?: number;
}

class AwsAssumedRole extends AwsCredentialsType implements AwsAssumedRoleConfig {
  roleArn: string;
  sessionName: string;
  region: string;
  primaryCredentials: AwsCredentialsClass;
  duration?: number;
  private stsClient: STS;
  private stsCreds: Credentials;

  constructor (props: AwsAssumedRoleConfig) {
    super();
    this.roleArn = props.roleArn;
    this.sessionName = props.sessionName;
    this.region = props.region || DEFAULT_REGION;
    this.primaryCredentials = props.primaryCredentials;
    this.duration = props.duration || ROLE_SESSION_DURATION_SECONDS;
  }

  static isAwsAssumedRole (credentials: AwsCredentialsConfig) {
    return 'roleArn' in credentials;
  }

  static fromJson (object: AwsAssumedRoleConfig): AwsAssumedRole {
    return new AwsAssumedRole({
      ...object,
      region: object.region || DEFAULT_REGION,
      primaryCredentials: this.buildPrimaryCreds(object.primaryCredentials),
      duration: object.duration || ROLE_SESSION_DURATION_SECONDS
    });
  }

  private static buildPrimaryCreds (credentials: AwsCredentialsConfig): AwsCredentialsClass {
    if (AwsKeys.isAwsKeys(credentials)) {
      return AwsKeys.fromJson({ ...(credentials as AwsKeysConfig) });
    } else if (LocalAwsProfile.isLocalAwsProfile(credentials)) {
      return LocalAwsProfile.fromJson({ ...(credentials as LocalAwsProfileConfig) });
    } else {
      return this.fromJson({ ...(credentials as AwsAssumedRoleConfig) });
    }
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

  private mapStsCredsToGenericCreds () {
    if (!this.stsCreds) {
      throw new Error('STS creds do not exist!');
    }
    return {
      accessKeyId: this.stsCreds.AccessKeyId,
      secretAccessKey: this.stsCreds.SecretAccessKey,
      sessionToken: this.stsCreds.SessionToken
    };
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V3) {
    // if sts creds exist and have not expired, return them as generic creds
    if (!this.credsWillExpireInSession()) {
      const genericCreds = this.mapStsCredsToGenericCreds();
      return this.getVersionedCredentials(awsSdkVersion, genericCreds);
    }
    const creds = await this.primaryCredentials.getCredentials(awsSdkVersion);
    this.stsClient = new STS({
      credentials: creds,
      region: this.region
    });
    const res = await this.stsClient.assumeRole({
      RoleArn: this.roleArn,
      RoleSessionName: this.sessionName,
      DurationSeconds: this.duration
    });
    this.stsCreds = res.Credentials;
    const genericCreds = this.mapStsCredsToGenericCreds();
    return this.getVersionedCredentials(awsSdkVersion, genericCreds);
  }
}

export {
  AwsAssumedRole
};