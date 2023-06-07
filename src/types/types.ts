import { AwsAssumedRole } from '../aws-provider/aws-credentials/aws-assumed-role';
import { AwsKeys } from '../aws-provider/aws-credentials/aws-keys';
import { LocalAwsProfile } from '../aws-provider/aws-credentials/local-aws-profile';

export type AwsCredentialsClass = AwsAssumedRole | AwsKeys | LocalAwsProfile;