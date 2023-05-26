import React from 'react';
import sortBy from 'lodash.sortby';
import { Widget } from '@tinystacks/ops-model';
import { ChevronRightIcon, RepeatIcon } from '@chakra-ui/icons';
import {
  BaseProvider,
  BaseWidget,
  TinyStacksError
} from '@tinystacks/ops-core';
import {
  ApprovalStatus,
  CodePipeline,
  GetPipelineStateOutput,
  PipelineDeclaration
} from '@aws-sdk/client-codepipeline';
import {
  Box,
  Button,
  ButtonGroup,
  Center,
  HStack,
  Stack,
  Text,
  Wrap,
  WrapItem,
  useColorModeValue
} from '@chakra-ui/react';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider.js';
import KeyValueStat from '../components/key-value-stat.js';
import { findProvider } from '../utils/utils.js';
import { IconButton } from 'rsuite';
import { StatusIcon } from '../components/status-icon.js';
import { Pill } from '../components/pill.js';
import dayjs from 'dayjs';

type AwsCodePipelineType = Widget & {
  pipelineName: string;
  region: string;
  pipeline?: Pipeline;
};

type AwsCodePipelineOverrides = {
  pipelineName?: string;
  region?: string;
  approval?: {
    stageName: string;
    actionName: string;
    status: ApprovalStatus;
    token: string;
  };
  startPipeline?: boolean;
};

type PipelineAction = {
  name: string;
  status: string;
  lastStatusChange?: Date;
  token?: string;
  category: string;
  provider: string;
  runOrder: number;
};

type StageAction = PipelineAction & {
  stageName: string;
}

type PipelineStage = {
  name: string;
  status: string;
  actions: PipelineAction[]
};

type Pipeline = {
  name: string;
  arn: string;
  stages: PipelineStage[]
}

class AwsCodePipeline extends BaseWidget implements AwsCodePipelineType {
  static type = 'AwsCloudWatchLogs';
  pipelineName: string;
  region: string;
  pipeline?: Pipeline;

  constructor (props: AwsCodePipelineType) {
    super(props);
    this.pipelineName = props?.pipelineName;
    this.region = props?.region;
    this.pipeline = props?.pipeline;
  }

  static fromJson (object: AwsCodePipelineType): AwsCodePipeline {
    return new AwsCodePipeline(object);
  }

  toJson (): AwsCodePipelineType {
    return {
      ...super.toJson(),
      region: this.region,
      pipelineName: this.pipelineName,
      pipeline: this.pipeline
    };
  }

  async getData (providers?: BaseProvider[], overrides: AwsCodePipelineOverrides = {}): Promise<void> {
    try {
      const {
        pipelineName = this.pipelineName,
        region = this.region,
        approval,
        startPipeline
      } = overrides;
      const awsCredentialsProvider = findProvider<AwsCredentialsProvider>(providers, AwsCredentialsProvider.type);
      const codePipelineClient = new CodePipeline({
        credentials: await awsCredentialsProvider.getCredentials(),
        region: region
      });

      if (approval) {
        const {
          actionName,
          stageName,
          status,
          token
        } = approval;
        await codePipelineClient.putApprovalResult({
          pipelineName,
          actionName,
          stageName,
          result: {
            status,
            summary: `${status} through Ops Console`
          },
          token
        });
      }
      if (startPipeline) {
        await codePipelineClient.startPipelineExecution({
          name: pipelineName
        });
      }
      const pipelineResponse = await codePipelineClient.getPipeline({
        name: this.pipelineName
      });
      const { pipeline = {}, metadata = {} } = pipelineResponse || {};
      const {
        name = this.pipelineName,
        stages = []
      } = pipeline as PipelineDeclaration;
      const pipelineState: GetPipelineStateOutput = await codePipelineClient.getPipelineState({
        name: this.pipelineName
      });
      this.pipeline = {
        name: name,
        arn: metadata.pipelineArn,
        stages: stages.map((stage) => {
          const stageState = pipelineState?.stageStates?.find(state => state.stageName === stage.name);
          return {
            name: stage.name,
            status: stageState?.latestExecution?.status,
            actions: stage.actions?.map((action) => {
              const actionState = stageState?.actionStates?.find(aState => aState.actionName === action.name);
              return {
                name: action.name,
                status: actionState?.latestExecution?.status,
                lastStatusChange: actionState?.latestExecution?.lastStatusChange,
                token: actionState?.latestExecution?.token,
                category: action.actionTypeId.category,
                provider: action.actionTypeId.provider,
                runOrder: action.runOrder
              };
            })
          };
        })
      };
    } catch (e: any) {
      console.error(e);
      throw TinyStacksError.fromJson({
        message: 'Failed to get Code Pipeline details!',
        status: e.status || e.$metadata?.status || 500,
        stack: e.stack
      });
    }
  }

  render (
    _children?: any,
    overridesCallback?: (overrides: AwsCodePipelineOverrides) => void
  ): JSX.Element {
    function submitApproval (action: StageAction, status: ApprovalStatus) {
      overridesCallback({
        approval: {
          actionName: action.name,
          stageName: action.stageName,
          status,
          token: action.token
        }
      });
    }

    function startPipeline () {
      overridesCallback({
        startPipeline: true
      });
    }

    const actions: StageAction[] = this.pipeline?.stages?.reduce((acc, stage) => {
      const stageActions = stage.actions?.map((action) => {
        return {
          stageName: stage.name,
          ...action
        };
      });
      acc.push(...sortBy(stageActions, 'runOrder'));
      return acc;
    }, []);
    const pipelineUrl =  this.pipelineName ?
      `https://${this.region}.console.aws.amazon.com/codesuite/codepipeline/pipelines/${this.pipelineName}/view?region=${this.region}` :
      `https://${this.region}.console.aws.amazon.com/codesuite/codepipeline/pipelines?region=${this.region}`;
    
    return (
      <Stack p='20px' data-testid='codepipeline-widget'>
        <KeyValueStat
          label='Pipeline Name'
          value={this.pipelineName}
        />
        <KeyValueStat
          label='Pipeline Arn'
          value={this.pipeline?.arn}
          href={pipelineUrl}
        />
        <Stack pt='10px'>
          <HStack>
            <Text fontSize='md'>Pipeline Actions</Text>
            <IconButton
              aria-label='Refresh CodePipeline'
              icon={<RepeatIcon />}
              onClick={() => overridesCallback({})}
              w={10}
              h={10}
            />
            <Button
              onClick={startPipeline}
            >
              Start pipeline
            </Button>
          </HStack>
          <Wrap data-testid='console-page-contents' spacing="5" maxWidth="7xl" className='widgetContainer' padding='1rem'>
            {actions?.map((a, index) => {
              const actionId = `${a.stageName}-${a.name}`;
              return (
                <WrapItem key={actionId}>
                  {
                    index !== 0 ?
                      <Center h="200px" mr={2.5}>
                        <Stack align="center" spacing="3">
                          <ChevronRightIcon w={10} h={10} />
                        </Stack>
                      </Center> :
                      <></>
                  }
                  <Box
                    as="section"
                    bg={useColorModeValue('gray.100', 'inherit')}
                    id={`pipeline-card-${actionId}`}
                  >
                    <Box maxW={{ base: 'xl', md: '7xl' }} mx="auto">
                      <Box
                        rounded="lg"
                        bg={useColorModeValue('white', 'gray.700')}
                        maxW="3xl"
                        mx="auto"
                        shadow="base"
                        overflow="hidden"
                        h="200px"
                        w="320px"
                      >
                        <Stack justify="space-between" height="100%">
                          <Box px="6" pt="4" flex="1">
                            <Stack spacing="5px" h="full">
                              <HStack justify="space-between" align="center">
                                <HStack justify="space-between" align="center"> 
                                  <Text
                                    as="h4"
                                    fontWeight="bold"
                                    fontSize="sm"
                                    textTransform="uppercase"
                                  >
                                    {a.stageName}
                                  </Text>
                                  <Pill 
                                    text={`${a.provider} ${a.category}`}
                                    tooltip={a.name}
                                  />
                                </HStack>
                                <StatusIcon
                                  awaitingApproval={(
                                    a.category === 'Approval' &&
                                    a.provider === 'Manual' &&
                                    a.status === 'InProgress'
                                  )}
                                  status={a.status}
                                />
                              </HStack>
                              <Stack justify="start" align='baseline' height='100%'>
                                <KeyValueStat
                                  label='Status'
                                  value={
                                    !a.status ?
                                      'N/A' :
                                      `${a.status}${a.lastStatusChange ? ` ${dayjs(new Date(a.lastStatusChange)).format('M/D/YYYY h:mA')}` : ''}`
                                  }
                                />
                                {
                                  (
                                    a.category === 'Approval' &&
                                    a.provider === 'Manual'
                                  ) ?
                                    <HStack justify="end" align='center' height='100%' width='100%'> 
                                      <Button
                                        colorScheme='blue'
                                        variant='outline'
                                        isDisabled={a.status !== 'InProgress'}
                                        onClick={() => submitApproval(a, 'Approved')}
                                      >
                                        Approve
                                      </Button>
                                      <Button
                                        colorScheme='red'
                                        variant='outline'
                                        isDisabled={a.status !== 'InProgress'}
                                        onClick={() => submitApproval(a, 'Rejected')}
                                      >
                                        Reject
                                      </Button>
                                    </HStack> :
                                    <></>
                                }
                              </Stack>
                            </Stack>
                          </Box>
                        </Stack>
                      </Box>
                    </Box>
                  </Box>
                </WrapItem>
              );
            })}
          </Wrap>
        </Stack>
      </Stack>
    );
  }
}

export {
  AwsCodePipeline,
  AwsCodePipelineType,
  AwsCodePipelineOverrides
};
export default AwsCodePipeline;