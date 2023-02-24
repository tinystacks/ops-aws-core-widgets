import { 
  AwsCredentialsProvider as AwsCredentialsProviderType,
  AwsAssumedRole as AwsAssumedRoleType,
  AwsKeys as AwsKeysType,
  LocalAwsProfile as LocalAwsProfileType
} from '@tinystacks/ops-model';
import { Provider } from '@tinystacks/ops-core';
import { AwsAssumedRole } from './aws-credentials/aws-assumed-role';
import { AwsKeys } from './aws-credentials/aws-keys';
import { LocalAwsProfile } from './aws-credentials/local-aws-profile';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials/aws-credentials-type';

class AwsCredentialsProvider extends Provider {
  static type = 'AwsCredentialsProvider';
  credentials: AwsCredentialsType;
  accountId?: string;
  region?: string;

  constructor (args: {
    credentials: AwsCredentialsType,
    accountId?: string,
    region?: string,
    id?: string,
  }) {
    const {
      credentials,
      accountId,
      region,
      id
    } = args;
    super(id, AwsCredentialsProvider.type);
    this.credentials = credentials;
    this.accountId = accountId;
    this.region = region;
  }

  static fromJson (object: AwsCredentialsProviderType): AwsCredentialsProvider {
    const {
      credentials,
      // accountId,
      // region,
      id
    } = object;

    let creds: AwsCredentialsType;
    if (AwsAssumedRole.isAwsAssumedRole(credentials)) {
      creds = AwsAssumedRole.fromJson({ ...(credentials as AwsAssumedRoleType) });
    } else if (AwsKeys.isAwsKeys(credentials)) {
      creds = AwsKeys.fromJson({ ...(credentials as AwsKeysType) });
    } else {
      creds = LocalAwsProfile.fromJson({ ...(credentials as LocalAwsProfileType) });
    }
    return new AwsCredentialsProvider({
      credentials: creds,
      id
    });
  }

  toJson () {
    return {
      credentials: this.credentials,
      accountId: this.accountId,
      region: this.region,
      id: this.id
    };
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V3) {
    return await this.credentials.getCredentials(awsSdkVersion);
  }
}

export { 
  AwsCredentialsProvider
};