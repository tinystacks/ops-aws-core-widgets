import { Widget as WidgetType } from '@tinystacks/ops-model';
import { Widget } from '@tinystacks/ops-core';
import { Fragment } from 'preact';
import { IAM } from '@aws-sdk/client-iam';
import { Policy } from 'aws-sdk/clients/iam';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider';
import { LocalAwsProfile } from '../aws-provider/aws-credentials/local-aws-profile';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type';
import isNil from 'lodash.isnil';

type AwsIamJsonType = WidgetType & {
  region: string,
  roleArn?: string,
  policyArn?: string,
}

export class AwsIamJson extends Widget implements AwsIamJsonType {
  static type = 'AwsIamJson';
  region: string;
  roleArn?: string;
  policyArn?: string;
  private _policy: Policy;
  private _rolePolicies: string[];


  constructor (args: AwsIamJsonType) {
    const {
      id,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      roleArn,
      policyArn
    } = args;
    super(
      id,
      displayName,
      AwsIamJson.type,
      providerId,
      showDisplayName,
      description,
      showDescription
    );
    this.region = region;
    this.roleArn = roleArn;
    this.policyArn = policyArn;
    this._policy = {};
    this._rolePolicies = [];

  }


  fromJson (object: AwsIamJsonType): AwsIamJson {
    const {
      id,
      type,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      roleArn, 
      policyArn
    } = object;

    if(isNil(roleArn) && isNil(policyArn)){ 
      throw new Error('Either role arn or policy arn must be defined for IAM Json Widget');
    }

    return new AwsIamJson({
      id,
      type,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      roleArn, 
      policyArn
    });
  }

  toJson (): AwsIamJsonType {

    return {
      id: this.id,
      type: this.type,
      displayName: this.displayName,
      providerId: this.providerId,
      showDisplayName: this.showDisplayName,
      description: this.description,
      showDescription: this.showDescription,
      region: this.region,
      roleArn: this.roleArn,
      policyArn: this.policyArn
    };
  }


  async getData (): Promise<void> {
    //TO-DO update as getData will take in a an array of providers
    try {
      const awsCred = this.provider as  AwsCredentialsProvider;
      const provider = new AwsCredentialsProvider({
        id: awsCred.id, 
        credentials: new LocalAwsProfile({ 
          profileName: (awsCred.credentials as any).profileName 
        })
      });
      const iamClient = new IAM({
        credentials: await provider.getCredentials(AwsSdkVersionEnum.V3),
        region: this.region
      });
      if (this.policyArn) {
        const res = await iamClient.getPolicy({
          PolicyArn: this.policyArn
        });
        this._policy = res.Policy;
      } else if(this.roleArn){ 
        let res = await iamClient.listRolePolicies({
          RoleName: this.roleArn
        });
        this._rolePolicies = [...this._rolePolicies, ...res.PolicyNames]; 
        while(res.Marker){ 
          res = await iamClient.listRolePolicies({
            RoleName: this.roleArn
          });
          this._rolePolicies = [...this._rolePolicies, ...res.PolicyNames]; 
        }
      }
    }
    catch (e) {
      throw new Error('Failed to get IAM Policy');
    }
  }

  get policy () {
    return this._policy;
  }

  get rolePolicies () { 
    return this._rolePolicies;
  }

  render (): JSX.Element { return <>TODO</>; }

}