import { fromIni } from '@aws-sdk/credential-provider-ini';
import { fromSSO } from '@aws-sdk/credential-provider-sso';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type.js';
import { AwsCredentialsConfig } from '../../types/types.js';

export type LocalAwsProfileConfig = { 
  profileName: string;
  sso?: boolean;
};

class LocalAwsProfile extends AwsCredentialsType implements LocalAwsProfileConfig {
  profileName: string;
  sso?: boolean;

  constructor (props: LocalAwsProfileConfig) {
    super();
    this.profileName = props.profileName;
    this.sso = props.sso || false;
  }

  static isLocalAwsProfile (credentials: AwsCredentialsConfig) {
    return 'profileName' in credentials;
  }

  static fromJson (object: LocalAwsProfileConfig): LocalAwsProfile {
    return new LocalAwsProfile(object);
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V3) {
    try {
      let sharedCreds: AwsCredentialIdentity;
      if (this.sso) {
        sharedCreds = await fromSSO({
          profile: this.profileName
        })();
      } else { 
        sharedCreds = await fromIni({
          profile: this.profileName
        })();
      }
      return this.getVersionedCredentials(awsSdkVersion, sharedCreds);
    } catch (e) {
      console.log(e);
      throw new Error(`Failed to read credentials from profile: ${this.profileName}!. Ensure ${this.profileName} exists in ~/.aws/credentials`);
    }
  }
}

export {
  LocalAwsProfile
};