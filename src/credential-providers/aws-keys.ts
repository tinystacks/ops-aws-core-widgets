// import { AwsKeys as AwsKeysType } from '@tinystacks/ops-model';

import AWS from 'aws-sdk';
import AwsCredentialsTypeV2 from '../credential-types/aws-credentials-type-v2';

class AwsKeys implements AwsCredentialsTypeV2 {
  AwsAccessKeyId: string;
  AwsSecretAccessKey: string;
  AwsSessionToken?: string;

  constructor (
    AwsAccessKeyId: string,
    AwsSecretAccessKey: string,
    AwsSessionToken?: string
  ) {
    this.AwsAccessKeyId = AwsAccessKeyId;
    this.AwsSecretAccessKey = AwsSecretAccessKey;
    this.AwsSessionToken = AwsSessionToken;
  }

  static fromObject (object: AwsKeys): AwsKeys {
    const {
      AwsAccessKeyId,
      AwsSecretAccessKey,
      AwsSessionToken
    } = object;
    return new AwsKeys(
      AwsAccessKeyId,
      AwsSecretAccessKey,
      AwsSessionToken
    );
  }

  async getV2Credentials () {
    return new AWS.Credentials({
      accessKeyId: this.AwsAccessKeyId,
      secretAccessKey: this.AwsSecretAccessKey,
      sessionToken: this.AwsSessionToken
    });
  }
}

export default AwsKeys;