import { Widget  } from '@tinystacks/ops-model';
import { BaseWidget } from '@tinystacks/ops-core';
import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import get from 'lodash.get';
import isObject from 'lodash.isobject';
import React from 'react';

type JsonTreeProps = Widget & {
  jsonObject: { [key: string]: any; },
  paths: {
    pathDisplayName: string,
    path: string
  }[],
  filteredJson: {
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
  private _filteredJson: {
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
  }

  get filteredJson () { return this._filteredJson; }
  set filteredJson (_filteredJson) { this._filteredJson = _filteredJson; }

  render (): JSX.Element {
    function KeyValueDisplay (props: { displayKey: string, value: string }) {
      return (
        <Box p={5} key={props.displayKey}>
          <Heading fontSize="s">{props.displayKey}</Heading>
          <Text mt={4}>{props.value}</Text>
        </Box>
      );
    }
    return (
      <Stack>
        {this.filteredJson.map(({ pathDisplayName, json }) => (
          <KeyValueDisplay
            displayKey={pathDisplayName}
            value={json}
          />
        ))}
      </Stack>
    );
  }

}