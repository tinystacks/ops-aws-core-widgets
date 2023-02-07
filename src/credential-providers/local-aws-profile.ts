// import { LocalAwsProfile as LocalAwsProfileType } from '@tinystacks/ops-model';

import { fromIni, fromNodeProviderChain } from '@aws-sdk/credential-providers';
import AWS from 'aws-sdk';
import { AwsCredentialsType, AwsSdkVersionEnum, getVersionedCredentials } from '../credential-types/aws-credentials-type';

class LocalAwsProfile implements AwsCredentialsType {
  profileName: string;

  constructor (args: {
    profileName: string
  }) {
    const { profileName } = args;
    this.profileName = profileName;
  }

  static fromObject (object: LocalAwsProfile): LocalAwsProfile {
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
    return getVersionedCredentials(
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