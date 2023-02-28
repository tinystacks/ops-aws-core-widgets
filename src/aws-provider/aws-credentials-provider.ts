import { BaseProvider } from '@tinystacks/ops-core';
import { AwsAssumedRole, AwsAssumedRoleType } from './aws-credentials/aws-assumed-role.js';
import { AwsKeys, AwsKeysType } from './aws-credentials/aws-keys.js';
import { LocalAwsProfile, LocalAwsProfileType } from './aws-credentials/local-aws-profile.js';
import { AwsSdkVersionEnum } from './aws-credentials/aws-credentials-type.js';
import { Provider } from '@tinystacks/ops-model';

type AwsCredentialsProviderProps = Provider & {
  credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType,
  accountId?: string,
  region?: string,
};

export class AwsCredentialsProvider extends BaseProvider {
  static type = 'AwsCredentialsProvider';
  credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType;
  accountId?: string;
  region?: string;

  constructor (args: AwsCredentialsProviderProps) {
    const {
      credentials,
      accountId,
      region
    } = args;
    super(args);
    this.credentials = credentials;
    this.accountId = accountId;
    this.region = region;
  }

  static fromJson (object: AwsCredentialsProviderProps): AwsCredentialsProvider {
    return new AwsCredentialsProvider(object);
  }

  toJson () {
    return {
      ...super.toJson(),
      credentials: this.credentials,
      accountId: this.accountId,
      region: this.region
    };
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V3) {
    const { credentials } = this;
    let creds: AwsAssumedRole | AwsKeys | LocalAwsProfile;
    if (AwsAssumedRole.isAwsAssumedRole(credentials)) {
      creds = AwsAssumedRole.fromJson({ ...(credentials as AwsAssumedRole) });
    } else if (AwsKeys.isAwsKeys(credentials)) {
      creds = AwsKeys.fromJson({ ...(credentials as AwsKeysType) });
    } else {
      creds = LocalAwsProfile.fromJson({ ...(credentials as LocalAwsProfileType) });
    }
    return await creds.getCredentials(awsSdkVersion);
  }
}