import { Widget } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { Fragment } from 'preact';
import { CloudControl } from 'aws-sdk';
import { ResourceDescription } from 'aws-sdk/clients/cloudcontrol';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type';
import isEmpty from 'lodash.isempty';

type AwsJsonTreeProps = Widget & {
  region: string,
  cloudControlType: string,
  paths?: string[]
}

export class AwsJsonTree extends BaseWidget {
  static type = 'AwsJsonTree';
  region: string;
  cloudControlType: string;
  paths?: string[];
  private _resourceDescriptions: ResourceDescription[]; 

  
  constructor (props: AwsJsonTreeProps) {
    super (props);
    this.region = props.region;
    this.cloudControlType = props.cloudControlType; 
    this.paths = props.paths;
    this._resourceDescriptions =[];

  }

  fromJson (object: AwsJsonTreeProps): AwsJsonTree {

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
      paths: this.paths };
  }

  
  async getData (providers?: BaseProvider[]): Promise<void> {
    if (!providers || isEmpty(providers) || providers[0].type !== 'AwsCredentialsProvider') {
      throw new Error('An AwsCredentialsProvider was expected, but was not given');
    }

    try{ 
      const awsProvider = BaseProvider.fromJson(providers[0]) as unknown as AwsCredentialsProvider;

      const cloudControlClient = new CloudControl({
        credentials: await awsProvider.getCredentials(AwsSdkVersionEnum.V3),
        region: this.region
      });

      let res = await cloudControlClient.listResources({ 
        TypeName: this.cloudControlType
      }).promise();

      this._resourceDescriptions = [...this._resourceDescriptions, ...res.ResourceDescriptions]; 
      while(res.NextToken){ 
        res = await cloudControlClient.listResources({ 
          TypeName: this.cloudControlType
        }).promise();

        this._resourceDescriptions = [...this._resourceDescriptions, ...res.ResourceDescriptions]; 
      }
    } catch(e){ 
      throw new Error(`Failed to list resources for resoruce type ${this.cloudControlType}`);
    }
    
  }

  get resourceDesciptions () {
    return this._resourceDescriptions;
  }

  render (): JSX.Element { return <>TODO</>; }

}