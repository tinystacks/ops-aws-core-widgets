import AwsAssumedRole from './credential-providers/aws-assumed-role';
import AwsKeys from './credential-providers/aws-keys';
import LocalAwsProfile from './credential-providers/local-aws-profile';

// TODO: Consolidate Provider interface
class AwsCredentialsProvider {
  id: string;
  credentials: AwsAssumedRole | AwsKeys | LocalAwsProfile;

  constructor(
    id: string,
    credentials: AwsAssumedRole | AwsKeys | LocalAwsProfile
  ) {
    // super(id);
    this.id = id;
    this.credentials = credentials;
  }

  static fromObject(object: AwsCredentialsProvider): AwsCredentialsProvider {
    const {
      id,
      credentials
    } = object;
    return new AwsCredentialsProvider(
      id,
      credentials
    );
  }

  async getV2Credentials(credentials: AwsAssumedRole | AwsKeys | LocalAwsProfile) {
    return await credentials.getV2Credentials();
  }

  async getV3Credentials(credentials: AwsAssumedRole | LocalAwsProfile) {
    return credentials.getV3Credentials();
  }
}

export default AwsCredentialsProvider;