import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type.js';
import { AwsCredentialsConfig } from '../../types/types.js';

export type LocalAwsProfileConfig = { 
  profileName: string;
};

class LocalAwsProfile extends AwsCredentialsType implements LocalAwsProfileConfig {
  profileName: string;

  constructor (props: LocalAwsProfileConfig) {
    super();
    this.profileName = props.profileName;
  }

  static isLocalAwsProfile (credentials: AwsCredentialsConfig) {
    return 'profileName' in credentials;
  }

  static fromJson (object: LocalAwsProfileConfig): LocalAwsProfile {
    return new LocalAwsProfile(object);
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V3) {
    try {
      const { fromIni } = await import('@aws-sdk/credential-provider-ini');
      const { fromSSO } = await import('@aws-sdk/credential-provider-sso');
      const sharedCreds = await fromSSO({
        profile: this.profileName
      })().catch(async () => {
        return await fromIni({
          profile: this.profileName
        })();
      });
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