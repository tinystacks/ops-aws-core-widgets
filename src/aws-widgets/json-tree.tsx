import { Widget  } from '@tinystacks/ops-model';
import { BaseWidget } from '@tinystacks/ops-core';
import { Box, Stack, Text } from '@chakra-ui/react';
import get from 'lodash.get';
import isObject from 'lodash.isobject';
import React from 'react';

type JsonTreeProps = Widget & {
  jsonObject: { [key: string]: any; },
  paths: {
    pathDisplayName: string,
    path: string
  }[],
  filteredJson?: {
    pathDisplayName: string,
    json: string
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
            isObject(value) ?
              JSON.stringify(value, undefined, 2) :
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

  /*get filteredJson () { return this._filteredJson; }
  set filteredJson (_filteredJson) { this._filteredJson = _filteredJson; }*/

  render (): JSX.Element {
    console.log(' render this.filteredJson: ', this.filteredJson
    );
    const boxStyles = { 
      overflow: 'scroll',
      flex: 'none',
      backgroundColor: '#EDF2F7',
      color: '#000000',
      height: '88px', 
      margin: '14px',
      padding: '24px', 
      width: 'full',
      alignSelf: 'stretch', 
      fontFamily: 'monospace', 
      fontStyle: 'normal',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '21px', 
      borderRadius: '8px'  
    };
    function KeyValueDisplay (props: { displayKey: string, value: string }) {
      return (
        <Box>
          <Text mt={4} style={{ color: '#5705D4' }}>{props.displayKey} : {props.value}</Text>
        </Box>
      );
    }
    return (
      <Stack style={{ backgroundColor: '#ffffff', width: '100%' }}>
        <Box style={boxStyles}> 
          {this.filteredJson.map(({ pathDisplayName, json }) => (
            <KeyValueDisplay
              displayKey={pathDisplayName}
              value={json}
            />
          ))}
        </Box>
      </Stack>
    );
  }

}