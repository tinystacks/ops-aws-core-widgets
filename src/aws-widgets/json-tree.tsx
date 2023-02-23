import { Widget as WidgetType } from '@tinystacks/ops-model';
import { Widget } from '@tinystacks/ops-core';
import { Fragment } from 'preact';
import get from 'lodash.get';

type JsonTreeType = WidgetType & {
  region: string,
  jsonObject: { [key: string]: any; },
  paths: string[]
}

export class JsonTree extends Widget implements JsonTreeType {
  static type = 'JsonTree';
  region: string;
  jsonObject: { [key: string]: any; };
  paths: string[];
  private _filteredJson: any[];

  
  constructor (args: JsonTreeType) {
    const {
      id,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      jsonObject, 
      paths
    } = args;
    super (
      id,
      displayName,
      JsonTree.type,
      providerId,
      showDisplayName,
      description,
      showDescription
    );
    this.region = region;
    this.jsonObject = jsonObject; 
    this.paths = paths;
    this._filteredJson = [];

  }

  fromJson (object: JsonTreeType): JsonTree {
    const {
      id,
      type,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      jsonObject, 
      paths
    } = object;
    return new JsonTree({
      id,
      type,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      jsonObject, 
      paths
    });
  }
  

  toJson (): JsonTreeType {
    return { 
      id: this.id,
      type: this.type,
      displayName: this.displayName,
      providerId: this.providerId,
      showDisplayName: this.showDisplayName,
      description: this.description,
      showDescription: this.showDescription,
      region: this.region,
      jsonObject: this.jsonObject,
      paths: this.paths
    };
  }

  
  getData (): void {
    this.paths.forEach((path) => { 
      const value = get(this.jsonObject, path); 
      if(value){ 
        this._filteredJson.push(value);
      }
    });
  }

  get filteredJson () {
    return this._filteredJson;
  }

  render (): JSX.Element { return <>TODO</>; }

}