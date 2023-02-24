import { 
  AwsKeys as AwsKeysType,
  AwsAssumedRole as AwsAssumedRoleType,
  LocalAwsProfile as LocalAwsProfileType
} from '@tinystacks/ops-model';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials-type';

class AwsKeys extends AwsCredentialsType implements AwsKeysType {
  AwsAccessKeyId: string;
  AwsSecretAccessKey: string;
  AwsSessionToken?: string;

  constructor (args: {
    AwsAccessKeyId: string,
    AwsSecretAccessKey: string,
    AwsSessionToken?: string
  }) {
    const { 
      AwsAccessKeyId,
      AwsSecretAccessKey,
      AwsSessionToken
    } = args;
    super();
    this.AwsAccessKeyId = AwsAccessKeyId;
    this.AwsSecretAccessKey = AwsSecretAccessKey;
    this.AwsSessionToken = AwsSessionToken;
  }

  static isAwsKeys (credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType) {
    return 'AwsAccessKeyId' in credentials;
  }

  static fromJson (object: AwsKeysType): AwsKeys {
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