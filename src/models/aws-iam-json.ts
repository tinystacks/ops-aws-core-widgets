import isNil from 'lodash.isnil';
import { Models, TinyStacksError } from '@tinystacks/ops-core';
import { Policy } from 'aws-sdk/clients/iam';
import { AwsIamJson as AwsIamJsonProps } from '../ops-types.js';

import Widget = Models.Widget;

export class AwsIamJson extends Widget {
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

  static fromJson (object: AwsIamJsonProps): AwsIamJson {
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

  get policy () { return this._policy; }
  set policy (_policy) { this._policy = _policy; }

  get rolePolicies () { return this._rolePolicies; }
  set rolePolicies (_rolePolicies) { this._rolePolicies = _rolePolicies; }
}