import { Models } from '@tinystacks/ops-core';
import { ResourceDescription } from 'aws-sdk/clients/cloudcontrol';
import { AwsJsonTree as AwsJsonTreeProps } from '../ops-types.js';

import Widget = Models.Widget;

export class AwsJsonTree extends Widget {
  static type = 'AwsJsonTree';
  region: string;
  cloudControlType: string;
  resourceModel?: string;
  paths?: string[];
  protected _resourceDescriptions: ResourceDescription[]; 

  
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

  get resourceDesciptions () {
    return this._resourceDescriptions;
  }
}