// import { LocalAwsProfile as LocalAwsProfileType } from '@tinystacks/ops-model';

import { fromIni } from '@aws-sdk/credential-providers';
import AWS from 'aws-sdk';
import AwsCredentialsType from '../credential-types/aws-credentials-type';

class LocalAwsProfile implements AwsCredentialsType {
  profileName: string;

  constructor (
    profileName: string
  ) {
    this.profileName = profileName;
  }

  static fromObject (object: LocalAwsProfile): LocalAwsProfile {
    const {
      profileName
    } = object;
    return new LocalAwsProfile(
      profileName
    );
  }

  async getV2Credentials () {
    const sharedCreds = new AWS.SharedIniFileCredentials({
      profile: this.profileName
    });
    return sharedCreds as AWS.Credentials;
  }

  getV3Credentials () {
    return fromIni({
      profile: this.profileName
    });
  }
}

export default LocalAwsProfile;