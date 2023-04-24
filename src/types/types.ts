import { AwsAssumedRole, AwsAssumedRoleConfig } from '../aws-provider/aws-credentials/aws-assumed-role.js';
import { AwsKeys, AwsKeysConfig } from '../aws-provider/aws-credentials/aws-keys.js';
import { LocalAwsProfile, LocalAwsProfileConfig } from '../aws-provider/aws-credentials/local-aws-profile.js';

export type AwsCredentialsConfig = AwsAssumedRoleConfig | AwsKeysConfig | LocalAwsProfileConfig;

export type AwsCredentialsClass = AwsAssumedRole | AwsKeys | LocalAwsProfile;