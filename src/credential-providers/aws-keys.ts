// import { AwsKeys as AwsKeysType } from '@tinystacks/ops-model';

import { AwsCredentialsType, AwsSdkVersionEnum, getVersionedCredentials } from '../credential-types/aws-credentials-type';
import { AwsKeys as AwsKeysType } from '@tinystacks/ops-model';

class AwsKeys implements AwsKeysType, AwsCredentialsType {
  AwsAccessKeyId: string;
  AwsSecretAccessKey: string;
  AwsSessionToken?: string;

  constructor(args: {
    AwsAccessKeyId: string,
    AwsSecretAccessKey: string,
    AwsSessionToken?: string
  }) {
    const { 
      AwsAccessKeyId,
      AwsSecretAccessKey,
      AwsSessionToken
    } = args;
    this.AwsAccessKeyId = AwsAccessKeyId;
    this.AwsSecretAccessKey = AwsSecretAccessKey;
    this.AwsSessionToken = AwsSessionToken;
  }

  static fromObject(object: AwsKeys): AwsKeys {
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

  async getCredentials(awsSdkVersion = AwsSdkVersionEnum.V2) {
    return getVersionedCredentials(
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