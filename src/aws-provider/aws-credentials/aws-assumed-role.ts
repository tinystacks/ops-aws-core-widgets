import AWS from 'aws-sdk';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type';
import { 
  AwsAssumedRole as AwsAssumedRoleType,
  AwsKeys as AwsKeysType,
  LocalAwsProfile as LocalAwsProfileType
} from '@tinystacks/ops-model';
import { AwsKeys } from './aws-keys';
import { LocalAwsProfile } from './local-aws-profile';

const ROLE_SESSION_DURATION_SECONDS = 3600;
const DEFAULT_REGION = 'us-east-1';

class AwsAssumedRole extends AwsCredentialsType implements AwsAssumedRoleType {
  roleArn: string;
  sessionName: string;
  region: string;
  primaryCredentials: AwsAssumedRole | AwsKeys | LocalAwsProfile;
  duration?: number;
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
      primaryCredentials,
      duration
    } = args;
    super();
    this.roleArn = roleArn;
    this.sessionName = sessionName;
    this.region = region || DEFAULT_REGION;
    this.primaryCredentials = primaryCredentials;
    this.duration = duration || ROLE_SESSION_DURATION_SECONDS;
  }

  static isAwsAssumedRole (credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType) {
    return 'roleArn' in credentials;
  }

  static fromJSON (object: AwsAssumedRoleType): AwsAssumedRole {
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
      region: region || DEFAULT_REGION,
      primaryCredentials: this.buildPrimaryCreds(primaryCredentials),
      duration: duration || ROLE_SESSION_DURATION_SECONDS
    });
  }

  private static buildPrimaryCreds (credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType): AwsAssumedRole | AwsKeys | LocalAwsProfile {
    if (AwsKeys.isAwsKeys(credentials)) {
      return AwsKeys.fromJSON({ ...(credentials as AwsKeysType) });
    } else if (LocalAwsProfile.isLocalAwsProfile(credentials)) {
      return LocalAwsProfile.fromJSON({ ...(credentials as LocalAwsProfileType) });
    } else {
      return this.fromJSON({ ...(credentials as AwsAssumedRoleType) });
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

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V2) {
    // if sts creds exist and have not expired, return them as generic creds
    if (!this.credsWillExpireInSession()) {
      const genericCreds = this.mapStsCredsToGenericCreds();
      return this.getVersionedCredentials(awsSdkVersion, genericCreds);
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
    return this.getVersionedCredentials(awsSdkVersion, genericCreds);
  }
}

export {
  AwsAssumedRole
};