import { Widget } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget, TinyStacksError } from '@tinystacks/ops-core';
import CloudControl, { ResourceDescription } from 'aws-sdk/clients/cloudcontrol';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type.js';
import isEmpty from 'lodash.isempty';
import { getAwsCredentialsProvider } from '../utils/utils.js';

type AwsJsonTreeProps = Widget & {
  region: string,
  cloudControlType: string,
  resourceModel?: string,
  paths?: string[]
}

export class AwsJsonTree extends BaseWidget {
  static type = 'AwsJsonTree';
  region: string;
  cloudControlType: string;
  resourceModel?: string;
  paths?: string[];
  private _resourceDescriptions: ResourceDescription[]; 

  
  constructor (props: AwsJsonTreeProps) {
    super (props);
    this.region = props.region;
    this.cloudControlType = props.cloudControlType; 
    this.resourceModel = props.resourceModel;
    this.paths = props.paths;
    this._resourceDescriptions =[];

  }

  static fromJson (object: AwsJsonTreeProps): AwsJsonTree {

    //TO-DO validate cloudControlType
    // Minimum length of 10. Maximum length of 196.
    //Pattern: [A-Za-z0-9]{2,64}::[A-Za-z0-9]{2,64}::[A-Za-z0-9]{2,64}
    return new AwsJsonTree(object);
  }
  
  

  toJson (): AwsJsonTreeProps {

    return { 
      ...super.toJson(),  
      region: this.region,
      cloudControlType: this.cloudControlType,
      resourceModel: this.resourceModel,
      paths: this.paths };
  }

  
  async getData (providers?: BaseProvider[]): Promise<void> {
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

  get resourceDesciptions () {
    return this._resourceDescriptions;
  }

  render (): JSX.Element { return <>TODO</>;  }

}