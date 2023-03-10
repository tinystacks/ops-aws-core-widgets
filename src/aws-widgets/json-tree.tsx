import { Widget  } from '@tinystacks/ops-model';
import { BaseWidget } from '@tinystacks/ops-core';
import { Box, Stack } from '@chakra-ui/react';
import get from 'lodash.get';
import React from 'react';

type JsonTreeProps = Widget & {
  jsonObject: { [key: string]: any; },
  paths: {
    pathDisplayName: string,
    path: string
  }[],
  filteredJson?: {
    pathDisplayName: string,
    json: any
  }[]
}

export class JsonTree extends BaseWidget {
  static type = 'JsonTree';
  jsonObject: { [key: string]: any; };
  paths: {
    pathDisplayName: string,
    path: string
  }[];
  filteredJson: {
    pathDisplayName: string,
    json: string
  }[];

  
  constructor (props: JsonTreeProps) {
    super(props);
    this.jsonObject = props.jsonObject; 
    this.paths = props.paths;
    this.filteredJson = props.filteredJson || [];
  }

  static fromJson (object: JsonTreeProps): JsonTree {
    return new JsonTree(object);
  }
  

  toJson (): JsonTreeProps {
    return { 
      ...super.toJson(),
      jsonObject: this.jsonObject,
      paths: this.paths,
      filteredJson: this.filteredJson
    };
  }

  
  getData (): void {
    this.filteredJson = [];
    try{ 
      this.paths.forEach(({ path, pathDisplayName }) => { 
        const value = get(this.jsonObject, path);
        this.filteredJson.push({
          pathDisplayName,
          json: !value ?
            `Value ${path} does not exist on source object` :
            value
        });
      });
      console.log('filetered json in getData: ', this.filteredJson);
      return;
    } catch(e){
      console.error(e);
      throw new Error(`Error getting data for json tree widger ${this.id}, ${e}`);
    }
  }

  render (): JSX.Element {
    const prettierJson : {[key: string]: any} = {};

    this.filteredJson.forEach((item) => { 
      prettierJson[item.pathDisplayName] = item.json;
    });

    const boxStyles = { 
      overflow: 'scroll',
      flex: 'none',
      backgroundColor: '#EDF2F7',
      color: '#000000',
      height: '400px', 
      margin: '14px',
      padding: '24px', 
      width: 'full',
      alignSelf: 'stretch', 
      alignItems: 'flex-start',
      lineHeight: '21px', 
      borderRadius: '8px', 
      maxHeight: '400px'  
    };
    return (
      <Stack style={{ backgroundColor: '#ffffff', width: '100%' }}>
        <Box style={boxStyles}>
          <pre style={{
            color: '#5705D4',
            margin: '0px',
            padding: '0px',
            lineHeight: '21px',
            fontFamily: 'monospace',
            fontStyle: 'normal',
            fontSize: '12px',
            fontWeight: '400'
          }}>
            {JSON.stringify(prettierJson, null, 2)}
          </pre>
        </Box>
      </Stack>
    );
  }

}