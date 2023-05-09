import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type.js';
import { AwsCredentialsConfig } from '../../types/types.js';
import { TinyStacksError } from '@tinystacks/ops-core';
import AWS from 'aws-sdk';

export type LocalAwsProfileConfig = { 
  profileName: string;
};

class LocalAwsProfile extends AwsCredentialsType implements LocalAwsProfileConfig {
  profileName: string;

  constructor (props: LocalAwsProfileConfig) {
    super();
    this.profileName = props.profileName;
    console.log(`Looking for ${this.profileName} in ~/.aws/credentials...`);
  }

  static isLocalAwsProfile (credentials: AwsCredentialsConfig) {
    return 'profileName' in credentials;
  }

  static fromJson (object: LocalAwsProfileConfig): LocalAwsProfile {
    return new LocalAwsProfile(object);
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V3) {
    try {
      const sharedCreds = new AWS.SharedIniFileCredentials({
        profile: this.profileName
      });
      if (!sharedCreds.accessKeyId) {
        throw new Error('Shared ini file failure!');
      }
      return this.getVersionedCredentials(awsSdkVersion, sharedCreds);
    } catch (e: any) {
      throw TinyStacksError.fromJson({
        message: `Failed to read credentials from profile: ${this.profileName}!. Ensure ${this.profileName} exists in ~/.aws/credentials`,
        status: e.status || e.$metadata?.status || 500,
        stack: e.stack
      });
    }
  }
}

export {
  LocalAwsProfile
};