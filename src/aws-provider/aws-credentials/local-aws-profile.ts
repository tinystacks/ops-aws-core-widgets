import { fromIni, fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { 
  LocalAwsProfile as LocalAwsProfileType,
  AwsAssumedRole as AwsAssumedRoleType,
  AwsKeys as AwsKeysType
 } from '@tinystacks/ops-model';
import AWS from 'aws-sdk';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type';

class LocalAwsProfile extends AwsCredentialsType implements LocalAwsProfileType {
  profileName: string;

  constructor (args: {
    profileName: string
  }) {
    super();
    const { profileName } = args;
    this.profileName = profileName;
  }

  static isLocalAwsProfile (credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType) {
    return 'profileName' in credentials;
  }

  static fromJSON (object: LocalAwsProfileType): LocalAwsProfile {
    const {
      profileName
    } = object;
    return new LocalAwsProfile({
      profileName
    });
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V2) {
    const sharedCreds = new AWS.SharedIniFileCredentials({
      profile: this.profileName
    });
    return super.getVersionedCredentials(
      awsSdkVersion, 
      {
        accessKeyId: sharedCreds.accessKeyId,
        secretAccessKey: sharedCreds.secretAccessKey,
        sessionToken: sharedCreds.sessionToken
      }
    );
  }

  // async getV3Credentials () {
  //   const credentials =

  //   return fromIni({
  //     profile: this.profileName
  //   });
  // }
}

export default LocalAwsProfile;