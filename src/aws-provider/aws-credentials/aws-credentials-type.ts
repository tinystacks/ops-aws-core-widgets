import AWS from 'aws-sdk';
import { AwsCredentialIdentity } from '@aws-sdk/types';

export type AwsCredentials = AWS.Credentials | AwsCredentialIdentity;
export enum AwsSdkVersionEnum {
  V2 = 'V2',
  V3 = 'V3'
}

// export function getVersionedCredentials(
//   awsSdkVersion: AwsSdkVersionEnum, 
//   creds: { 
//     accessKeyId: string, 
//     secretAccessKey: string, 
//     sessionToken?: string
//   }): AwsCredentials {

//   switch (awsSdkVersion) {
//     case AwsSdkVersionEnum.V2:
//       return new AWS.Credentials({...creds});
//     case AwsSdkVersionEnum.V3:
//       return creds as AwsCredentialIdentity;
//     default:
//       return new AWS.Credentials({...creds});
//   }
// }

// export interface AwsCredentialsType {
//   getCredentials(awsSdkVersion?: AwsSdkVersionEnum): Promise<AwsCredentials>;
// }

export abstract class AwsCredentialsType {

  abstract getCredentials(awsSdkVersion?: AwsSdkVersionEnum): Promise<AwsCredentials>;

  getVersionedCredentials(
    awsSdkVersion: AwsSdkVersionEnum, 
    creds: { 
      accessKeyId: string, 
      secretAccessKey: string, 
      sessionToken?: string
    }): AwsCredentials {
  
    switch (awsSdkVersion) {
      case AwsSdkVersionEnum.V2:
        return new AWS.Credentials({...creds});
      case AwsSdkVersionEnum.V3:
        return creds as AwsCredentialIdentity;
      default:
        return new AWS.Credentials({...creds});
    }
  }
}