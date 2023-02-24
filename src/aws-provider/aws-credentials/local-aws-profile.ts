import AWS from 'aws-sdk';
import { AwsAssumedRoleType } from './aws-assumed-role.js';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type.js';
import { AwsKeysType } from './aws-keys.js';

export type LocalAwsProfileType = {
  profileName: string
};

class LocalAwsProfile extends AwsCredentialsType implements LocalAwsProfileType {
  profileName: string;

  constructor (args: LocalAwsProfileType) {
    const { 
      profileName
    } = args;
    super();
    this.profileName = profileName;
  }

  static isLocalAwsProfile (credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType) {
    return 'profileName' in credentials;
  }

  static fromJson (object: LocalAwsProfileType): LocalAwsProfile {
    const {
      profileName
    } = object;
    return new LocalAwsProfile({
      profileName
    });
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V3) {
    try {
      const sharedCreds = new AWS.SharedIniFileCredentials({
        profile: this.profileName
      });
      return this.getVersionedCredentials(
        awsSdkVersion, 
        {
          accessKeyId: sharedCreds.accessKeyId,
          secretAccessKey: sharedCreds.secretAccessKey,
          sessionToken: sharedCreds.sessionToken
        }
      );
    } catch (e) {
      console.log(e);
      throw new Error(`Failed to read credentials from profile: ${this.profileName}!. Ensure ${this.profileName} exists in ~/.aws/credentials`);
    }
  }
}

export {
  LocalAwsProfile
};