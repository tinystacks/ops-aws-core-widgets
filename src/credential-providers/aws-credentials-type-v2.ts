import AWS from 'aws-sdk';

interface AwsCredentialsTypeV2 {
  getV2Credentials(): Promise<AWS.Credentials | AWS.STS.Credentials>;
}

export default AwsCredentialsTypeV2;