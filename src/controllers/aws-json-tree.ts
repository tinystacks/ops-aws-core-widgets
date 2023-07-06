import isEmpty from 'lodash.isempty';
import { Controllers, Provider, TinyStacksError } from '@tinystacks/ops-core';
import CloudControl from 'aws-sdk/clients/cloudcontrol';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type.js';
import { getAwsCredentialsProvider } from '../utils/utils.js';
import { AwsJsonTree as AwsJsonTreeProps } from '../ops-types.js';
import { AwsJsonTree as AwsJsonTreeModel } from '../models/aws-json-tree.js';

import Widget = Controllers.Widget;

export class AwsJsonTree extends AwsJsonTreeModel implements Widget {
  static fromJson (object: AwsJsonTreeProps): AwsJsonTree {

    //TO-DO validate cloudControlType
    // Minimum length of 10. Maximum length of 196.
    //Pattern: [A-Za-z0-9]{2,64}::[A-Za-z0-9]{2,64}::[A-Za-z0-9]{2,64}
    return new AwsJsonTree(object);
  }

  async getData (providers?: Provider[]): Promise<void> {
    if (!providers || isEmpty(providers) || providers[0].type !== 'AwsCredentialsProvider') {
      throw TinyStacksError.fromJson({
        message: 'An AwsCredentialsProvider was expected, but was not given',
        status: 400
      });
    }

    try{ 
      const awsCredentialsProvider = getAwsCredentialsProvider(providers);
      const cloudControlClient = new CloudControl({
        credentials: await awsCredentialsProvider.getCredentials(AwsSdkVersionEnum.V3),
        region: this.region
      });

      let res = await cloudControlClient.listResources({ 
        TypeName: this.cloudControlType
      }).promise();

      this._resourceDescriptions = [...this._resourceDescriptions, ...res.ResourceDescriptions]; 
      while(res.NextToken){ 
        res = await cloudControlClient.listResources({ 
          TypeName: this.cloudControlType, 
          ResourceModel: this.resourceModel
        }).promise();
        this._resourceDescriptions = [...this._resourceDescriptions, ...res.ResourceDescriptions]; 
      }
    } catch (e: any) {
      throw TinyStacksError.fromJson({
        message: `Failed to list resources for resoruce type ${this.cloudControlType}`,
        status: e.status || e.$metadata?.status || 500,
        stack: e.stack
      });
    }
    
  }
}