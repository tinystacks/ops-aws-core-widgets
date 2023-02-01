import AWS from 'aws-sdk';
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import AwsCredentialsType from '../credential-providers/aws-credentials-type';

class AwsAssumedRole implements AwsCredentialsType {
  roleArn: string;
  sessionName: string;
  duration?: number;
  stsClient: AWS.STS;

  constructor(
    roleArn: string,
    sessionName: string,
    duration?: number
  ) {
    this.roleArn = roleArn;
    this.sessionName = sessionName;
    this.duration = duration;
    this.stsClient = new AWS.STS();
  }

  static fromObject(object: AwsAssumedRole): AwsAssumedRole {
    const {
      roleArn,
      sessionName,
      duration
    } = object;
    return new AwsAssumedRole(
      roleArn,
      sessionName,
      duration
    );
  }

  // TODO: Implement correctly with two assume roles: one for master credentials one for assumed role
  // TODO: parameterize region
  async getV2Credentials() {
    // this.stsClient.assumeRole()
    return new AWS.Credentials({
      accessKeyId: '',
      secretAccessKey: '',
      sessionToken: ''
    })
  }

  // TODO: Fill in master credentials
  // TODO: parameterize region
  getV3Credentials() {
    return fromTemporaryCredentials({
      masterCredentials: fromTemporaryCredentials({
        params: {
          RoleArn: ''
        }
      }),
      params: {
        RoleArn: this.roleArn,
        RoleSessionName: this.sessionName,
        DurationSeconds: this.duration
      },
      clientConfig: {
        region: 'us-east-1'
      }
    })
  }
}

export default AwsAssumedRole;