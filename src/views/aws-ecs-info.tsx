import React from 'react';
import {
  Link,
  SimpleGrid,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { Views } from '@tinystacks/ops-core';
import EcsPortsModal from './components/ecs-ports-modal.js';
import EcsEnvVarsModal from './components/ecs-env-vars-modal.js';
import {
  asgArnToUrl,
  cloudwatchLogsGroupArnToUrl,
  ecsClusterArnToUrl,
  ecsServiceArnToUrl,
  ecsTaskDefinitionArnToUrl
} from '../utils/arn-utils.js';
import KeyValueStat from './components/key-value-stat.js';
import { AwsEcsInfo as AwsEcsInfoModel, AwsEcsInfoType } from '../models/aws-ecs-info.js';

import Widget = Views.Widget;

export class AwsEcsInfo extends AwsEcsInfoModel implements Widget {
  static fromJson (object: AwsEcsInfoType): AwsEcsInfo {
    const awsEcsInfo = new AwsEcsInfo(object);
    awsEcsInfo.serviceArn = object.serviceArn;
    awsEcsInfo.clusterArn = object.clusterArn;
    awsEcsInfo.runningCount = object.runningCount;
    awsEcsInfo.desiredCount = object.desiredCount;
    awsEcsInfo.capacity = object.capacity;
    awsEcsInfo.asgArn = object.asgArn;
    awsEcsInfo.memory = object.memory;
    awsEcsInfo.cpu = object.cpu;
    awsEcsInfo.taskDefinitionArn = object.taskDefinitionArn;
    awsEcsInfo.status = object.status;
    awsEcsInfo.roleArn = object.roleArn;
    awsEcsInfo.execRoleArn = object.execRoleArn;
    awsEcsInfo.images = object.images;
    return awsEcsInfo;
  }

  render (): JSX.Element {
    const imageRows = this.images?.map((image) => {
      return (
        <Tr>
          <Td>{image?.containerId}</Td>
          <Td>
            <EcsPortsModal image={image} />
          </Td>
          <Td>
            <EcsEnvVarsModal image={image} />
          </Td>
          <Td>{(image.volumes || []).map(v => v.name).join(', ')}</Td>
          <Td><Link color='purple' href={cloudwatchLogsGroupArnToUrl(image.cwLogsGroupArn)} target='_blank'>View logs</Link></Td>
        </Tr>
      );
    });
    return (
      <Stack p='20px'>
        <SimpleGrid columns={4} spacing={10}>
          <KeyValueStat
            label='Cluster Arn'
            value={this.clusterArn}
            href={ecsClusterArnToUrl(this.clusterArn)}
          />
          <KeyValueStat
            label='Service Arn'
            value={this.serviceArn}
            href={ecsServiceArnToUrl(this.serviceArn)}
          />
          <KeyValueStat
            label='Tasks Running/Desired'
            value={`${this.runningCount}/${this.desiredCount}`}
          />
          <KeyValueStat
            label='Active Task Def Id'
            value={this.taskDefinitionArn}
            href={ecsTaskDefinitionArnToUrl(this.taskDefinitionArn)}
          />
          <KeyValueStat
            label='Provisioned CPU'
            value={this.cpu}
          />
          <KeyValueStat
            label='Provisioned Memory'
            value={this.memory}
          />
          <KeyValueStat
            label='Capacity'
            value={`${this.capacity} (${this.capacityType || 'Fargate'})`}
          />
          {
            this.asgArn && 
              <KeyValueStat
                label='ASG'
                value={this.asgArn}
                href={asgArnToUrl(this.asgArn)}
              />
          }
        </SimpleGrid>
        <Stack pt='10px'>
          <Text fontSize='md'>Containers</Text>
          <TableContainer border='1px' borderRadius='6px' borderColor='gray.100'>
            <Table variant="simple">
              <Thead bgColor='gray.50'>
                <Tr>
                  <Th>Container Id</Th>
                  <Th>Port Mappings</Th>
                  <Th>Environment Variables</Th>
                  <Th>Volumes</Th>
                  <Th>View logs</Th>
                </Tr>
              </Thead>
              <Tbody>
                {imageRows}
              </Tbody>
            </Table>
          </TableContainer>
        </Stack>
      </Stack>
    );
  }
}