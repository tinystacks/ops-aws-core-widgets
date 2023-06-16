import React from 'react';
import sortBy from 'lodash.sortby';
import dayjs from 'dayjs';
import { ChevronRightIcon, RepeatIcon } from '@chakra-ui/icons';
import { Views } from '@tinystacks/ops-core';
import { ApprovalStatus } from '@aws-sdk/client-codepipeline';
import {
  Box,
  Button,
  Center,
  HStack,
  Stack,
  Text,
  Wrap,
  WrapItem,
  useColorModeValue
} from '@chakra-ui/react';
import KeyValueStat from './components/key-value-stat.js';
import { IconButton } from 'rsuite';
import { StatusIcon } from './components/status-icon.js';
import { Pill } from './components/pill.js';
import {
  AwsCodePipeline as AwsCodePipelineType,
  StageAction
} from '../ops-types.js';
import {
  AwsCodePipeline as AwsCodePipelineModel,
  AwsCodePipelineOverrides
} from '../models/aws-code-pipeline.js';

import Widget = Views.Widget;

class AwsCodePipeline extends AwsCodePipelineModel implements Widget {
  static fromJson (object: AwsCodePipelineType): AwsCodePipeline {
    return new AwsCodePipeline(object);
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
  AwsCodePipeline
};
export default AwsCodePipeline;