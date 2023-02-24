import AWS from 'aws-sdk';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type';
import { AwsAssumedRoleType } from './aws-assumed-role';
import { AwsKeysType } from './aws-keys';

export type LocalAwsProfileType = { 
  profileName: string;
};


class LocalAwsProfile extends AwsCredentialsType implements LocalAwsProfileType {
  profileName: string;

  constructor (props: LocalAwsProfileType) {
    super();
    this.profileName = props.profileName;
  }

  static isLocalAwsProfile (credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType) {
    return 'profileName' in credentials;
  }

  static fromJson (object: LocalAwsProfileType): LocalAwsProfile {

    return new LocalAwsProfile(object);
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