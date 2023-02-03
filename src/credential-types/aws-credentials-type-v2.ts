import AWS from 'aws-sdk';

interface AwsCredentialsTypeV2 {
  getV2Credentials(): Promise<AWS.Credentials>;
}

export default AwsCredentialsTypeV2;