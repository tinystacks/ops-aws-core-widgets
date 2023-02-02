import AWS from 'aws-sdk';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import AwsCredentialsType from '../credential-providers/aws-credentials-type';
import AwsCredentialsTypeV2 from '../credential-providers/aws-credentials-type-v2';

const ROLE_SESSION_DURATION_SECONDS = 3600;

class AwsAssumedRole implements AwsCredentialsType {
  roleArn: string;
  sessionName: string;
  region: string;
  duration?: number;
  masterCredentials?: AwsCredentialsTypeV2 | AwsCredentialsType;
  private stsClient: AWS.STS;
  private stsCreds: AWS.STS.Credentials;

  constructor(args: {
    roleArn: string,
    sessionName: string,
    region: string,
    duration?: number,
    masterCredentials?: AwsCredentialsTypeV2 | AwsCredentialsType;
  }) {
    const {
      roleArn,
      sessionName,
      region,
      duration,
      masterCredentials
    } = args;
    this.roleArn = roleArn;
    this.sessionName = sessionName;
    this.duration = duration || ROLE_SESSION_DURATION_SECONDS;
    this.region = region;
    this.stsClient = new AWS.STS({ region });
    this.masterCredentials = masterCredentials;
  }

  static fromObject(object: AwsAssumedRole): AwsAssumedRole {
    const {
      roleArn,
      sessionName,
      region,
      duration,
      masterCredentials
    } = object;
    return new AwsAssumedRole({
      roleArn,
      sessionName,
      region,
      duration,
      masterCredentials
    });
  }

  private credsWillExpireInSession() {
    const credsExist = !!this.stsCreds;
    if (!credsExist) {
      return true;
    }
    // TODO: simplify the statements below
    const timeSinceCredsWereSet = this.stsCreds.Expiration.getTime() - new Date().getTime();
    const serviceCredsWillExpireInSession = timeSinceCredsWereSet < this.duration * 1000
    return serviceCredsWillExpireInSession;
  }

  private mapStsCredsToGenericCreds() {
    if (!this.stsCreds) {
      throw new Error('STS creds do not exist!');
    }
    return new AWS.Credentials({
      accessKeyId: this.stsCreds.AccessKeyId,
      secretAccessKey: this.stsCreds.SecretAccessKey,
      sessionToken: this.stsCreds.SessionToken
    })
  }

  async getV2Credentials() {
    // if sts creds exist and have not expired, return them as generic creds
    if (!this.credsWillExpireInSession()) {
      const genericCreds = this.mapStsCredsToGenericCreds();
      return genericCreds;
    }
    // TODO: figure out how not to reconstruct the master STS client on each call to getV2Credentials
    if (this.masterCredentials) {
      const creds = await this.masterCredentials.getV2Credentials();
      this.stsClient = new AWS.STS({
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken,
        region: this.region
      });
    }
    const res = await this.stsClient.assumeRole({
      RoleArn: this.roleArn,
      RoleSessionName: this.sessionName,
      DurationSeconds: this.duration
    }).promise();
    this.stsCreds = res.Credentials;
    const genericCreds = this.mapStsCredsToGenericCreds()
    return genericCreds;
  }

  getV3Credentials() {
    let creds;
    if (this.masterCredentials as AwsCredentialsType) {
      creds = (this.masterCredentials as AwsCredentialsType).getV3Credentials();
    } else {
      throw new Error('Failed to get V3 credentials for the provided masterCredentials. V3 credentials are not supported by all credential types');
    }
    return fromTemporaryCredentials({
      params: {
        RoleArn: this.roleArn,
        RoleSessionName: this.sessionName,
        DurationSeconds: this.duration
      },
      clientConfig: {
        region: this.region
      },
      ...(creds && { masterCredentials: creds })
    });
  }
}

export default AwsAssumedRole;