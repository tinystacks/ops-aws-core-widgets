import { BaseProvider } from '@tinystacks/ops-core';
import { AwsAssumedRole, AwsAssumedRoleConfig } from './aws-credentials/aws-assumed-role.js';
import { AwsKeys, AwsKeysConfig } from './aws-credentials/aws-keys.js';
import { LocalAwsProfile, LocalAwsProfileConfig } from './aws-credentials/local-aws-profile.js';
import { AwsSdkVersionEnum } from './aws-credentials/aws-credentials-type.js';
import { Provider } from '@tinystacks/ops-model';
import { CliEnvironmentProvider } from '@tinystacks/ops-core-widgets';
import { AwsCredentialsClass, AwsCredentialsConfig } from '../types/types.js';

type AwsCredentialsProviderProps = Provider & {
  credentials: AwsCredentialsConfig,
  accountId?: string,
  region?: string,
  cliEnv?: { [key: string]: string }
};

export class AwsCredentialsProvider extends BaseProvider implements CliEnvironmentProvider {
  static type = 'AwsCredentialsProvider';
  credentials: AwsCredentialsConfig;
  accountId?: string;
  region?: string;

  constructor (args: AwsCredentialsProviderProps) {
    const {
      credentials,
      accountId,
      region
    } = args;
    super(args);
    this.credentials = credentials;
    this.accountId = accountId;
    this.region = region;
  }

  static fromJson (object: AwsCredentialsProviderProps): AwsCredentialsProvider {
    return new AwsCredentialsProvider(object);
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V3) {
    const { credentials } = this;
    let creds: AwsCredentialsClass;
    if (AwsAssumedRole.isAwsAssumedRole(credentials)) {
      creds = AwsAssumedRole.fromJson({ ...(credentials as AwsAssumedRoleConfig) });
    } else if (AwsKeys.isAwsKeys(credentials)) {
      creds = AwsKeys.fromJson({ ...(credentials as AwsKeysConfig) });
    } else {
      creds = LocalAwsProfile.fromJson({ ...(credentials as LocalAwsProfileConfig) });
    }
    return await creds.getCredentials(awsSdkVersion);
  }

  async getCliEnvironment (..._args: any): Promise<{ [key: string]: string; }> {
    const envVars: any = {};
    const populatedCreds = await this.getCredentials();
    envVars['AWS_ACCESS_KEY_ID'] = populatedCreds.accessKeyId;
    envVars['AWS_SECRET_ACCESS_KEY'] = populatedCreds.secretAccessKey;

    if (populatedCreds.sessionToken) {
      envVars['AWS_SESSION_TOKEN'] = populatedCreds.sessionToken;
    }

    return envVars;
  }
}