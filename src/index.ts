import AwsAssumedRole from './credential-providers/aws-assumed-role';
import AwsKeys from './credential-providers/aws-keys';
import LocalAwsProfile from './credential-providers/local-aws-profile';
import AwsCredentialsType from './credential-types/aws-credentials-type';

// TODO: Consolidate Provider interface
class AwsCredentialsProvider {
  id: string;
  credentials: AwsAssumedRole | AwsKeys | LocalAwsProfile;

  constructor (
    id: string,
    credentials: AwsAssumedRole | AwsKeys | LocalAwsProfile
  ) {
    // super(id);
    this.id = id;
    this.credentials = credentials;
  }

  static fromObject (object: AwsCredentialsProvider): AwsCredentialsProvider {
    const {
      id,
      credentials
    } = object;
    return new AwsCredentialsProvider(
      id,
      credentials
    );
  }

  async getV2Credentials () {
    return await this.credentials.getV2Credentials();
  }

  getV3Credentials () {
    return (this.credentials as AwsCredentialsType).getV3Credentials();
  }
}

export default AwsCredentialsProvider;