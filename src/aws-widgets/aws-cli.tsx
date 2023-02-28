import { Widget  } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { exec } from 'child_process';
import util from "node:util";

const execPromise = util.promisify(exec);

type AwsCliProps = Widget & {
  command: string
}

export class AwsCli extends BaseWidget {
  static type = 'AwsCli';
  command: string;
  private _commandResult: {stdout: string, stderr: string}; 
  private _hasDataBeenFetched: boolean;
  
  constructor (props: AwsCliProps) {
    super(props);
    this.command = props.command;
    this._commandResult = {
      stdout: '', 
      stderr: ''
    };
    this._hasDataBeenFetched = false;
  }

  fromJson (object: AwsCliProps): AwsCli {
    return new AwsCli(object);
  }
  

  toJson (): AwsCliProps {
    return { 
      ...super.toJson(),  
      command: this.command 
    };
  }

  async getData (providers?: BaseProvider[], overrides?: { [key: string]: any; }): Promise<void> {
    try{ 
      if(overrides && (overrides['runOnStart'] || overrides['run'])){ 
        const {stdout, stderr} = await execPromise(this.command);
        this._commandResult = { 
          stdout: stdout,  
          stderr: stderr
        }
        return;
      }
      if(overrides && overrides['clear']){ 
        this._commandResult = {
          stdout: '', 
          stderr: ''
        };
        return;
      }
      if(!overrides){ 
        const {stdout, stderr} = await execPromise(this.command);
        this._commandResult = { 
          stdout: stdout,  
          stderr: stderr
        }
        return;
      }
    } catch(e){ 
      throw new Error(`Error executing command ${this.command}, ${e}`);
    }
    
  }

  get commandResult () {
    return this._commandResult;
  }
  render (): JSX.Element { return <>TODO</>; }

}