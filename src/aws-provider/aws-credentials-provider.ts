import AwsAssumedRole from './aws-credentials/aws-assumed-role';
import AwsKeys from './aws-credentials/aws-keys';
import LocalAwsProfile from './aws-credentials/local-aws-profile';
import { 
  AwsProfileProvider as AwsProfileProviderType,
  AwsAssumedRole as AwsAssumedRoleType,
  AwsKeys as AwsKeysType,
  LocalAwsProfile as LocalAwsProfileType
 } from '@tinystacks/ops-model';
import { AwsCredentialsType } from './aws-credentials/aws-credentials-type';

// TODO: Consolidate Provider interface
class AwsCredentialsProvider {
  static type = 'AwsCredentialsProvider';
  credentials: AwsCredentialsType;
  accountId?: string;
  region?: string;
  id?: string;

  constructor (args: {
    credentials: AwsCredentialsType,
    accountId?: string,
    region?: string,
    id?: string,
  }) {
    // super(id);
    const {
      credentials,
      accountId,
      region,
      id
    } = args;
    this.credentials = credentials;
    this.accountId = accountId;
    this.region = region;
    this.id = id;
  }

  static fromJSON (object: AwsProfileProviderType): AwsCredentialsProvider {
    const {
      type,
      credentials,
      // accountId,
      // region,
      id
    } = object;

    // if (this.isAwsAssumedRole(creds)) {
    //   let awsAssumedRole = creds as AwsAssumedRoleType;
    //   credentials = new AwsAssumedRole({
    //     roleArn: awsAssumedRole.roleArn,
    //     sessionName: awsAssumedRole.sessionName,
    //     region: awsAssumedRole.region,
    //     duration: awsAssumedRole.duration,
    //     primaryCredentials: this.buildAwsAssumedRolePrimaryCreds(awsAssumedRole)
    //   });
    // } else if (this.isAwsKeys(creds)) {
    //   credentials = new AwsKeys({...creds as AwsKeys})
    // } else {
    //   credentials = new LocalAwsProfile({...creds as LocalAwsProfileType});
    // }
    let creds: AwsCredentialsType;
    if (AwsAssumedRole.isAwsAssumedRole(credentials)) {
      creds = AwsAssumedRole.fromJSON({...(credentials as AwsAssumedRoleType)});
    } else if (AwsKeys.isAwsKeys(credentials)) {
      creds = AwsKeys.fromJSON({...(credentials as AwsKeysType)});
    } else {
      creds = LocalAwsProfile.fromJSON({...(credentials as LocalAwsProfileType)});
    }
    return new AwsCredentialsProvider({
      credentials: creds
    });
  }

  async getCredentials () {
    return await this.credentials.getCredentials();
  }

  // private static isAwsAssumedRole (credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType) {
  //   return 'roleArn' in credentials;
  // }

  // private static isAwsKeys (credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType) {
  //   return 'AwsAccessKeyId' in credentials;
  // }

  // private static isLocalAwsProfile (credentials: AwsAssumedRoleType | AwsKeysType | LocalAwsProfileType) {
  //   return 'profileName' in credentials;
  // }

  // private static buildAwsAssumedRolePrimaryCreds (credentials: AwsAssumedRoleType): AwsKeys | LocalAwsProfile | AwsAssumedRole {
  //   if (this.isAwsKeys(credentials.primaryCredentials)) {
  //     return new AwsKeys({...(credentials.primaryCredentials as AwsKeysType)})
  //   } else if (this.isLocalAwsProfile(credentials.primaryCredentials)) {
  //     return new LocalAwsProfile({...(credentials.primaryCredentials as LocalAwsProfileType)});
  //   } else {
  //     const primaryAssumedRoleCreds = credentials.primaryCredentials as AwsAssumedRoleType;
  //     return new AwsAssumedRole({
  //       roleArn: primaryAssumedRoleCreds.roleArn,
  //       sessionName: primaryAssumedRoleCreds.sessionName,
  //       region: primaryAssumedRoleCreds.region,
  //       duration: primaryAssumedRoleCreds.duration,
  //       primaryCredentials: this.buildAwsAssumedRolePrimaryCreds(primaryAssumedRoleCreds)
  //     });
  //   }
  // }

  // getV3Credentials () {
  //   return (this.credentials as AwsCredentialsType).getV3Credentials();
  // }
}

export default AwsCredentialsProvider;