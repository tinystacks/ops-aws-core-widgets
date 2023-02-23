import { Widget } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { Fragment } from 'preact';
import { IAM } from '@aws-sdk/client-iam';
import { Policy } from 'aws-sdk/clients/iam';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type';
import isNil from 'lodash.isnil';
import isEmpty from 'lodash.isempty';

type AwsIamJsonProps = Widget & {
  region: string,
  roleArn?: string,
  policyArn?: string,
}

export class AwsIamJson extends BaseWidget {
  static type = 'AwsIamJson';
  region: string;
  roleArn?: string;
  policyArn?: string;
  private _policy: Policy;
  private _rolePolicies: string[];


  constructor (props: AwsIamJsonProps) {
    super(props);
    this.region = props.region;
    this.roleArn = props.roleArn;
    this.policyArn = props.policyArn;
    this._policy = {};
    this._rolePolicies = [];

  }

  fromJson (object: AwsIamJsonProps): AwsIamJson {
    if(isNil(object.roleArn) && isNil(object.policyArn)){ 
      throw new Error('Either role arn or policy arn must be defined for IAM Json Widget');
    }

    return new AwsIamJson(object);
  }

  toJson (): AwsIamJsonProps {
    return { 
      ...super.toJson(),  
      region: this.region,
      roleArn: this.roleArn,
      policyArn: this.policyArn };
  }


  async getData (providers?: BaseProvider[]): Promise<void> {
    if (!providers || isEmpty(providers) || providers[0].type !== 'AwsCredentialsProvider') {
      throw new Error('An AwsCredentialsProvider was expected, but was not given');
    }
    try {
      const awsProvider = BaseProvider.fromJson(providers[0]) as unknown as AwsCredentialsProvider;
      
      const iamClient = new IAM({
        credentials: await awsProvider.getCredentials(AwsSdkVersionEnum.V3),
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