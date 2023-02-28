import { Widget  } from '@tinystacks/ops-model';
import { BaseWidget } from '@tinystacks/ops-core';
import get from 'lodash.get';

type JsonTreeProps = Widget & {
  region: string,
  jsonObject: { [key: string]: any; },
  paths: {
    pathDisplayName: string,
    path: string
  }[]
}

export class JsonTree extends BaseWidget {
  static type = 'JsonTree';
  region: string;
  jsonObject: { [key: string]: any; };
  paths: {
    pathDisplayName: string,
    path: string
  }[];
  private _filteredJson: any[];

  
  constructor (props: JsonTreeProps) {
    super(props);
    this.region = props.region;
    this.jsonObject = props.jsonObject; 
    this.paths = props.paths;
    this._filteredJson = [];
  }

  fromJson (object: JsonTreeProps): JsonTree {
    return new JsonTree(object);
  }
  

  toJson (): JsonTreeProps {
    return { 
      ...super.toJson(),  
      region: this.region,
      jsonObject: this.jsonObject,
      paths: this.paths };
  }

  
  getData (): void {
    this.paths.forEach(({ path }) => { 
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