import { AwsAssumedRoleType } from './aws-assumed-role.js';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type.js';
import { LocalAwsProfileType } from './local-aws-profile.js';

export type AwsKeysType = { 
  AwsAccessKeyId: string;
  AwsSecretAccessKey: string;
  AwsSessionToken?: string;
}

class AwsKeys extends AwsCredentialsType implements AwsKeysType{
  AwsAccessKeyId: string;
  AwsSecretAccessKey: string;
  AwsSessionToken?: string;

  constructor (props: AwsKeysType) {
    super();
    this.AwsAccessKeyId = props.AwsAccessKeyId;
    this.AwsSecretAccessKey = props.AwsSecretAccessKey;
    this.AwsSessionToken = props.AwsSessionToken;
  }

  static isAwsKeys (credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType) {
    return 'AwsAccessKeyId' in credentials;
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V3) {
    return this.getVersionedCredentials(
      awsSdkVersion, 
      {
        accessKeyId: this.AwsAccessKeyId,
        secretAccessKey: this.AwsSecretAccessKey,
        sessionToken: this.AwsSessionToken
      }
    );
  }
}

export {
  AwsKeys
};