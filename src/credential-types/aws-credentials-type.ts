import { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import AwsCredentialsTypeV2 from './aws-credentials-type-v2';

interface AwsCredentialsType extends AwsCredentialsTypeV2 {
  getV3Credentials(): AwsCredentialIdentityProvider;
}

export default AwsCredentialsType;