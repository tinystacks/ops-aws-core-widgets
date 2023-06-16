import isEmpty from 'lodash.isempty';
import isNil from 'lodash.isnil';
import { Controllers, Provider, TinyStacksError } from '@tinystacks/ops-core';
import { IAM } from '@aws-sdk/client-iam';
import { getAwsCredentialsProvider } from '../utils/utils.js';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type.js';
import { AwsIamJson as AwsIamJsonProps } from '../ops-types.js';
import { AwsIamJson as AwsIamJsonModel } from '../models/aws-iam-json.js';

import Widget = Controllers.Widget;

export class AwsIamJson extends AwsIamJsonModel implements Widget {
  static fromJson (object: AwsIamJsonProps): AwsIamJson {
    if(isNil(object.roleArn) && isNil(object.policyArn)){ 
      throw TinyStacksError.fromJson({
        message: 'Either role arn or policy arn must be defined for IAM Json Widget',
        status: 400
      });
    }

    return new AwsIamJson(object);
  }

  async getData (providers?: Provider[]): Promise<void> {
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
        this.policy = res.Policy;
      } else if(this.roleArn){ 
        let res = await iamClient.listRolePolicies({
          RoleName: this.roleArn
        });
        this.rolePolicies = [...this.rolePolicies, ...res.PolicyNames]; 
        while(res.Marker){ 
          res = await iamClient.listRolePolicies({
            RoleName: this.roleArn
          });
          this.rolePolicies = [...this.rolePolicies, ...res.PolicyNames]; 
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
}