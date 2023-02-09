// import { AwsKeys as AwsKeysType } from '@tinystacks/ops-model';

import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type';
import { 
  AwsKeys as AwsKeysType,
  AwsAssumedRole as AwsAssumedRoleType,
  LocalAwsProfile as LocalAwsProfileType
} from '@tinystacks/ops-model';

class AwsKeys extends AwsCredentialsType implements AwsKeysType {
  AwsAccessKeyId: string;
  AwsSecretAccessKey: string;
  AwsSessionToken?: string;

  constructor (args: {
    AwsAccessKeyId: string,
    AwsSecretAccessKey: string,
    AwsSessionToken?: string
  }) {
    super();
    const { 
      AwsAccessKeyId,
      AwsSecretAccessKey,
      AwsSessionToken
    } = args;
    this.AwsAccessKeyId = AwsAccessKeyId;
    this.AwsSecretAccessKey = AwsSecretAccessKey;
    this.AwsSessionToken = AwsSessionToken;
  }

  static isAwsKeys (credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType) {
    return 'AwsAccessKeyId' in credentials;
  }

  static fromJSON (object: AwsKeysType): AwsKeys {
    const {
      AwsAccessKeyId,
      AwsSecretAccessKey,
      AwsSessionToken
    } = object;
    return new AwsKeys({
      AwsAccessKeyId,
      AwsSecretAccessKey,
      AwsSessionToken
    });
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

export default AwsKeys;