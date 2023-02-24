import { BaseProvider } from '@tinystacks/ops-core';
import { AwsAssumedRole, AwsAssumedRoleType } from './aws-credentials/aws-assumed-role';
import { AwsKeys, AwsKeysType } from './aws-credentials/aws-keys';
import { LocalAwsProfile, LocalAwsProfileType } from './aws-credentials/local-aws-profile';
import { AwsCredentialsType, AwsSdkVersionEnum } from './aws-credentials/aws-credentials-type';

type AwsCredentialsProviderProps =  BaseProvider & { 
  credentials: AwsCredentialsType;
  accountId?: string;
  region?: string;
}
type AwsCredentialsProviderType = Omit<AwsCredentialsProviderProps, 'credentials'> & { 
  credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType
};

class AwsCredentialsProvider extends BaseProvider {
  static type = 'AwsCredentialsProvider';
  credentials: AwsCredentialsType;
  accountId?: string;
  region?: string;

  constructor (props: AwsCredentialsProviderProps) {
    super(props.id, AwsCredentialsProvider.type);
    this.credentials = props.credentials;
    this.accountId = props.accountId;
    this.region = props.region;
  }

  static fromJson (object: AwsCredentialsProviderType): AwsCredentialsProviderProps { //this should return a Promise<BaseProvider> | BaseProvider
    let creds;
    if (AwsAssumedRole.isAwsAssumedRole(object.credentials)) {
      creds = AwsAssumedRole.fromJson({ ...(object.credentials as AwsAssumedRoleType) });
    } else if (AwsKeys.isAwsKeys(object.credentials)) {
      creds = AwsKeys.fromJson({ ...(object.credentials as AwsKeysType) });
    } else {
      creds = LocalAwsProfile.fromJson({ ...(object.credentials as LocalAwsProfileType) });
    }
    
    return new AwsCredentialsProvider({ 
      ...object,
      credentials: creds });

  }

  toJson () {
    return { 
      ...super.toJson(),  
      credentials: this.credentials,
      accountId: this.accountId,
      region: this.region,
      id: this.id
    };
  }

  async getCredentials (awsSdkVersion = AwsSdkVersionEnum.V2) {
    return await this.credentials.getCredentials(awsSdkVersion);
  }
}

export { 
  AwsCredentialsProvider
};