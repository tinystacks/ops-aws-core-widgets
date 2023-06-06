import React from 'react';
import isEmpty from 'lodash.isempty';
import isNil from 'lodash.isnil';
import { BaseProvider, BaseWidget, TinyStacksError } from '@tinystacks/ops-core';
import { IAM } from '@aws-sdk/client-iam';
import { Policy } from 'aws-sdk/clients/iam';
import { getAwsCredentialsProvider } from '../utils/utils.js';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type.js';
import { AwsIamJson as AwsIamJsonProps } from '../ops-types.js';

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
    this.policy = {};
    this.rolePolicies = [];
  }

  fromJson (object: AwsIamJsonProps): AwsIamJson {
    if(isNil(object.roleArn) && isNil(object.policyArn)){ 
      throw TinyStacksError.fromJson({
        message: 'Either role arn or policy arn must be defined for IAM Json Widget',
        status: 400
      });
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
      throw TinyStacksError.fromJson({
        message: 'An AwsCredentialsProvider was expected, but was not given',
        status: 400
      });
    }

    try {
      const awsCredentialsProvider = getAwsCredentialsProvider(providers);
      const iamClient = new IAM({
        credentials: await awsCredentialsProvider.getCredentials(AwsSdkVersionEnum.V3),
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
    catch (e: any) {
      throw TinyStacksError.fromJson({
        message: 'Failed to get IAM Policy',
        status: e.status || e.$metadata?.status || 500,
        stack: e.stack
      });
    }
  }

  get policy () { return this._policy; }
  set policy (_policy) { this._policy = _policy; }

  get rolePolicies () { return this._rolePolicies; }
  set rolePolicies (_rolePolicies) { this._rolePolicies = _rolePolicies; }

  render (): JSX.Element { return <>TODO</>; }

}