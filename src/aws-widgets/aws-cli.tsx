import { Widget  } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import isEmpty from 'lodash.isempty';
import { exec } from 'child_process';

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
    if (!providers || isEmpty(providers) || providers[0].type !== 'AwsCredentialsProvider') {
      throw new Error('An AwsCredentialsProvider was expected, but was not given');
    }

    try{ 
      if(overrides && (overrides['runOnStart'] || overrides['run'])){ 
        exec(this.command, (error, stdout, stderr) => {
          if (error) {
            throw new Error(`Error executing command ${this.command}, ${error}`); 
          }
          this._commandResult.stdout = stdout;
          this._commandResult.stderr = stderr;
        });
      }
      if(overrides && overrides['clear']){ 
        this._commandResult = {
          stdout: '', 
          stderr: ''
        };
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