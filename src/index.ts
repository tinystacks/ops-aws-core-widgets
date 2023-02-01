import AwsAssumedRole from './credential-types/aws-assumed-role';
import AwsKeys from './credential-types/aws-keys';
import LocalAwsProfile from './credential-types/local-aws-profile';

// TODO: Consolidate Provider interface
class AwsCredentialsProvider {
  credentials: AwsAssumedRole | AwsKeys | LocalAwsProfile;

  constructor(
    // id: string,
    credentials: AwsAssumedRole | AwsKeys | LocalAwsProfile
  ) {
    // super(id);
    this.credentials = credentials;
  }

  static fromObject(object: AwsCredentialsProvider): AwsCredentialsProvider {
    const {
      // id,
      credentials
    } = object;
    return new AwsCredentialsProvider(
      // id,
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