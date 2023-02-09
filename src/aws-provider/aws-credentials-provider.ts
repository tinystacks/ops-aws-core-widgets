import AwsAssumedRole from './aws-credentials/aws-assumed-role';
import AwsKeys from './aws-credentials/aws-keys';
import LocalAwsProfile from './aws-credentials/local-aws-profile';
import { 
  AwsCredentialsProvider as AwsCredentialsProviderType,
  AwsAssumedRole as AwsAssumedRoleType,
  AwsKeys as AwsKeysType,
  LocalAwsProfile as LocalAwsProfileType
} from '@tinystacks/ops-model';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials/aws-credentials-type';
// import Provider from './temporary-classes/provider';

// TODO: Consolidate Provider interface
class AwsCredentialsProvider {
  type: string;
  credentials: AwsCredentialsType;
  accountId?: string;
  region?: string;
  id?: string;

  constructor (args: {
    type: string,
    credentials: AwsCredentialsType,
    accountId?: string,
    region?: string,
    id?: string,
  }) {
    // super(type);
    const {
      type,
      credentials,
      accountId,
      region,
      id
    } = args;
    this.type = type;
    this.credentials = credentials;
    this.accountId = accountId;
    this.region = region;
    this.id = id;
  }

  static fromJSON (object: AwsCredentialsProviderType): AwsCredentialsProvider {
    const {
      type,
      credentials,
      // accountId,
      // region,
      id
    } = object;

    let creds: AwsCredentialsType;
    if (AwsAssumedRole.isAwsAssumedRole(credentials)) {
      creds = AwsAssumedRole.fromJSON({ ...(credentials as AwsAssumedRoleType) });
    } else if (AwsKeys.isAwsKeys(credentials)) {
      creds = AwsKeys.fromJSON({ ...(credentials as AwsKeysType) });
    } else {
      creds = LocalAwsProfile.fromJSON({ ...(credentials as LocalAwsProfileType) });
    }
    return new AwsCredentialsProvider({
      type,
      credentials: creds,
      id
    });
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V2) {
    return await this.credentials.getCredentials(awsSdkVersion);
  }
}

export default AwsCredentialsProvider;