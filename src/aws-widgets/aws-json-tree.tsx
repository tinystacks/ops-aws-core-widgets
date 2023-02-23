import { Widget as WidgetType } from '@tinystacks/ops-model';
import { Widget } from '@tinystacks/ops-core';
import { Fragment } from 'preact';
import { CloudControl } from 'aws-sdk';
import { ResourceDescription } from 'aws-sdk/clients/cloudcontrol';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider';
import { LocalAwsProfile } from '../aws-provider/aws-credentials/local-aws-profile';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type';

type AwsJsonTreeType = WidgetType & {
  region: string,
  cloudControlType: string,
  paths?: string[]
}

export class AwsJsonTree extends Widget implements AwsJsonTreeType {
  static type = 'AwsJsonTree';
  region: string;
  cloudControlType: string;
  paths?: string[];
  private _resourceDescriptions: ResourceDescription[]; 

  
  constructor (args: AwsJsonTreeType) {
    const {
      id,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      cloudControlType, 
      paths
    } = args;
    super (
      id,
      displayName,
      AwsJsonTree.type,
      providerId,
      showDisplayName,
      description,
      showDescription
    );
    this.region = region;
    this.cloudControlType = cloudControlType; 
    this.paths = paths;
    this._resourceDescriptions =[];

  }

  fromJson (object: AwsJsonTreeType): AwsJsonTree {

    //TO-DO validate cloudControlType
    // Minimum length of 10. Maximum length of 196.
    //Pattern: [A-Za-z0-9]{2,64}::[A-Za-z0-9]{2,64}::[A-Za-z0-9]{2,64}

    const {
      id,
      type,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      cloudControlType, 
      paths
    } = object;
    return new AwsJsonTree({
      id,
      type,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      cloudControlType, 
      paths
    });
  }
  

  toJson (): AwsJsonTreeType {
    return { 
      id: this.id,
      type: this.type,
      displayName: this.displayName,
      providerId: this.providerId,
      showDisplayName: this.showDisplayName,
      description: this.description,
      showDescription: this.showDescription,
      region: this.region,
      cloudControlType: this.cloudControlType,
      paths: this.paths
    };
  }

  
  async getData (): Promise<void> {

    try{ 

      //TO-DO update as getData will take in a an array of providers
      const awsCred = this.provider as  AwsCredentialsProvider;
      const provider = new AwsCredentialsProvider({
        id: awsCred.id, 
        credentials: new LocalAwsProfile({ 
          profileName: (awsCred.credentials as any).profileName 
        })
      });

      const cloudControlClient = new CloudControl({
        credentials: await provider.getCredentials(AwsSdkVersionEnum.V3),
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