import React from 'react';
import { Widget  } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { Box, Button, Heading, Stack } from '@chakra-ui/react';


type AwsCliProps = Widget & {
  command: string
  runOnStart?: boolean
}

type AwsCliOverrides = { 
  clear?: boolean, 
  run?: boolean

}

export class AwsCli extends BaseWidget {
  static type = 'AwsCli';
  command: string;
  runOnStart: boolean;
  private _commandResult: {stdout: string, stderr: string}; 
  
  constructor (props: AwsCliProps) {
    super(props);
    this.command = props.command;
    this.runOnStart = props.runOnStart || true;
    this._commandResult = {
      stdout: '', 
      stderr: ''
    };
  }

  static fromJson (object: AwsCliProps): AwsCli {
    return new AwsCli(object);
  }
  

  toJson (): AwsCliProps {
    return { 
      ...super.toJson(),  
      command: this.command, 
      runOnStart: this.runOnStart 
    };
  }

  async getData (providers?: BaseProvider[], overrides?: AwsCliOverrides): Promise<void> {
    const depMap = {
      childproc: 'child_process',
      nodeutil: 'node:util'
    };
    
    const exec = (await import (depMap['childproc']))['exec'];
    const promisify = (await import (depMap['nodeutil']))['promisify'];
    const execPromise = promisify(exec); 

    try{ 
      if(this.runOnStart){ 
        const { stdout, stderr } = await execPromise(this.command);
        this.commandResult = { 
          stdout: stdout,  
          stderr: stderr
        };
        return;
      }
      if(overrides &&  overrides['run']){ 
        const { stdout, stderr } = await execPromise(this.command);
        this.commandResult = { 
          stdout: stdout,  
          stderr: stderr
        };
        return;
      }
      if(overrides && overrides['clear']){ 
        this.commandResult = {
          stdout: '', 
          stderr: ''
        };
        return;
      }
    } catch(e){ 
      throw new Error(`Error executing command ${this.command}, ${e}`);
    }
    
  }

  get commandResult () {
    return this._commandResult;
  }

  set commandResult (_commandResult) { 
    this._commandResult = _commandResult;
  }
  
  render (_children?: any, overridesCallback?: (overrides: AwsCliOverrides) => void): JSX.Element { 
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
    const commandResultRender = (this._commandResult.stderr || this._commandResult.stdout) ? 
      <Box style={boxStyles}>
        {this.commandResult.stderr}
        {this.commandResult.stdout}
        <Button style={{
          display: 'flex',
          backgroundColor: '#FFFFFF', 
          flex: 'none',
          color: '#344054', 
          fontFamily: 'Inter', 
          fontStyle: 'normal',
          fontWeight: '600', 
          fontSize: '14px',
          lineHeight: '20px', 
          border: '1px solid #D0D5DD', 
          borderRadius: '8px', 
          float: 'right'
        }} onClick={
          () => overridesCallback({ clear: true })} >
          Clear
        </Button>
      </Box> : 
      <Box style={boxStyles}>
          Command has not been run yet!
      </Box>;

    return (
      <Stack style={{ backgroundColor: '#ffffff', width: '100%' }}>
        <Box 
          style={boxStyles}
        >
          {this.command}
          <Button  style={{
            display: 'flex',
            backgroundColor: '#7F56D9', 
            flex: 'none',
            color: '#FFFFFF', 
            fontFamily: 'Inter', 
            fontStyle: 'normal',
            fontWeight: '600', 
            fontSize: '14px',
            lineHeight: '20px', 
            border: '1px solid #7F56D9', 
            borderRadius: '8px', 
            float: 'right'
          }} onClick={
            () => overridesCallback({ run: true })}>
          Run
          </Button>
        </Box>
        <Heading style={{ 
          color: '#000000', 
          fontFamily: 'Inter', 
          fontStyle: 'normal',
          fontWeight: '600', 
          fontSize: '16px',
          lineHeight: '24px', 
          paddingLeft: '24px'
        }}> 
          Response:
        </Heading>
        { commandResultRender }
      </Stack>
    );
  }

}