import React from 'react';
import { Widget } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { Box, Button, Code, Heading, HStack, Spacer, Stack } from '@chakra-ui/react';
import isEmpty from 'lodash.isempty';

type AwsCliProps = Widget & {
  command: string
  commandResult?: { stdout: string, stderr: string };
  runOnStart?: boolean
  hasRun?: boolean
}

type AwsCliOverrides = {
  clear?: boolean,
  run?: boolean
}

export class AwsCli extends BaseWidget {
  static type = 'AwsCli';
  command: string;
  runOnStart: boolean;
  commandResult: { stdout: string, stderr: string };
  hasRun: boolean;

  constructor (props: AwsCliProps) {
    super(props);
    this.command = props.command;
    this.runOnStart = props.runOnStart === true;
    this.commandResult = props.commandResult || {
      stdout: '',
      stderr: ''
    };
    this.hasRun = props.hasRun === true;
  }

  static fromJson (object: AwsCliProps): AwsCli {
    return new AwsCli(object);
  }


  toJson (): AwsCliProps {
    return {
      ...super.toJson(),
      command: this.command,
      commandResult: this.commandResult,
      runOnStart: this.runOnStart,
      hasRun: this.hasRun
    };
  }

  async getData (providers?: BaseProvider[], overrides?: AwsCliOverrides): Promise<void> {
    const depMap = {
      childproc: 'child_process',
      nodeutil: 'node:util'
    };

    const exec = (await import(depMap['childproc']))['exec'];
    const promisify = (await import(depMap['nodeutil']))['promisify'];
    const execPromise = promisify(exec);

    const shouldRun =
      // if this is the first load and runOnStart is true
      (!this.hasRun && this.runOnStart === true)
      // if an override told it to run
      || (overrides && overrides.run === true);

    try {
      if (shouldRun) {
        const { stdout, stderr } = await execPromise(this.command);
        this.commandResult = {
          stdout: stdout,
          stderr: stderr
        };
        this.hasRun = true;
      } else if (overrides && overrides.clear === true) {
        this.commandResult = {
          stdout: '',
          stderr: ''
        };
      }
    } catch (e: any) {
      console.error(e);
      this.commandResult = { stdout: '', stderr: e.toString() };
    }

  }

  render (_children?: any, overridesCallback?: (overrides: AwsCliOverrides) => void): JSX.Element {
    const commandResultRender = (!isEmpty(this.commandResult.stderr) || !isEmpty(this.commandResult.stdout)) ?
      <HStack spacing='24px'>
        <Box maxH='400px' w='100%' overflow='scroll'>
          <pre>
            {this.commandResult.stderr}
            {this.commandResult.stdout}
          </pre>
        </Box>
        <Spacer />
        <Button
          color='black' bg='white' m='2' borderColor='gray.300' borderWidth='1px'
          onClick={() => overridesCallback({ clear: true })}
        >
          Clear
        </Button>
      </HStack>
      : 'Command has not been run yet!';

    return (
      <Stack w='100%' p='4'>
        <Code borderRadius='md' p='4'>
          <HStack spacing='24px'>
            <Box maxH='400px' w='100%' overflow='scroll'>
              <pre>
                {this.command}
              </pre>
            </Box>
            <Spacer />
            <Button
              colorScheme='purple' m='2'
              onClick={() => overridesCallback({ run: true })}
            >
              Run
            </Button>
          </HStack>
        </Code>
        <Heading size='sm'>
          Response:
        </Heading>
        <Code borderRadius='md' p='4'>
          {commandResultRender}
        </Code>
      </Stack>
    );
  }

}