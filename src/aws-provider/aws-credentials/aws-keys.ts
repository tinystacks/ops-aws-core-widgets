import { AwsAssumedRoleType } from './aws-assumed-role';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type';
import { LocalAwsProfileType } from './local-aws-profile';

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

  static fromJson (object: AwsKeysType): AwsKeys {
    return new AwsKeys(object);
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V2) {
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