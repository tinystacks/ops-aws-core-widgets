import { AwsCredentialsConfig } from '../../types/types.js';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type.js';

export type AwsKeysConfig = { 
  AwsAccessKeyId: string;
  AwsSecretAccessKey: string;
  AwsSessionToken?: string;
}

class AwsKeys extends AwsCredentialsType implements AwsKeysConfig {
  AwsAccessKeyId: string;
  AwsSecretAccessKey: string;
  AwsSessionToken?: string;

  constructor (props: AwsKeysConfig) {
    super();
    this.AwsAccessKeyId = props.AwsAccessKeyId;
    this.AwsSecretAccessKey = props.AwsSecretAccessKey;
    this.AwsSessionToken = props.AwsSessionToken;
  }

  static isAwsKeys (credentials: AwsCredentialsConfig) {
    return 'AwsAccessKeyId' in credentials;
  }

  static fromJson (object: AwsKeysConfig): AwsKeys {
    return new AwsKeys(object);
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