import React from 'react';
import get from 'lodash.get';
import { Link, SimpleGrid, Stack, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import {
  ECS,
  DescribeTaskDefinitionCommandOutput,
  DescribeCapacityProvidersCommandOutput
} from '@aws-sdk/client-ecs';
import { STS } from '@aws-sdk/client-sts';
import { AutoScaling } from '@aws-sdk/client-auto-scaling';
import { BaseProvider, BaseWidget, TinyStacksError } from '@tinystacks/ops-core';
import { getAwsCredentialsProvider } from '../utils/utils.js';
import { getCoreEcsData, hydrateImages } from '../utils/aws-ecs-utils.js';
import EcsPortsModal from '../components/ecs-ports-modal.js';
import EcsEnvVarsModal from '../components/ecs-env-vars-modal.js';
import { asgArnToUrl, cloudwatchLogsGroupArnToUrl, ecsClusterArnToUrl, ecsServiceArnToUrl, ecsTaskDefinitionArnToUrl, getAsgNameFromArn, getTaskDefIdFromArn } from '../utils/arn-utils.js';
import KeyValueStat from '../components/key-value-stat.js';
import { AwsEcsInfo as AwsEcsInfoProps } from '../ops-types.js';
import { Image } from '../utils/aws-ecs-utils.js';

type AwsEcsInfoType = AwsEcsInfoProps & {
  serviceArn: string;
  clusterArn: string;
  runningCount: number;
  desiredCount: number;
  capacity: number;
  asgArn: string;
  asgName: string;
  memory: string;
  cpu: string;
  taskDefinitionArn: string,
  taskDefinitionVersion: number,
  status: string;
  roleArn: string;
  execRoleArn: string;
  images: Image[];
  capacityType: 'EC2' | 'Fargate';
}

export class AwsEcsInfo extends BaseWidget {
  static type = 'AwsEcsInfo';
  region: string;
  clusterName: string;
  serviceName: string;
  serviceArn: string;
  clusterArn: string;
  runningCount: number;
  desiredCount: number;
  capacity: number;
  asgArn: string;
  asgName: string;
  memory: string;
  cpu: string;
  taskDefinitionArn: string;
  taskDefinitionVersion: number;
  status: string;
  roleArn: string;
  execRoleArn: string;
  images: Image[];
  capacityType: 'EC2' | 'Fargate';

  constructor (props: AwsEcsInfoType) {
    super(props);
    this.region = props.region;
    this.clusterName = props.clusterName;
    this.serviceName = props.serviceName;
  }

  static fromJson (object: AwsEcsInfoType): AwsEcsInfo {
    const awsEcsInfo = new AwsEcsInfo(object);
    awsEcsInfo.serviceArn = object.serviceArn;
    awsEcsInfo.clusterArn = object.clusterArn;
    awsEcsInfo.runningCount = object.runningCount;
    awsEcsInfo.desiredCount = object.desiredCount;
    awsEcsInfo.capacity = object.capacity;
    awsEcsInfo.asgArn = object.asgArn;
    awsEcsInfo.asgName = object.asgName;
    awsEcsInfo.memory = object.memory;
    awsEcsInfo.cpu = object.cpu;
    awsEcsInfo.taskDefinitionArn = object.taskDefinitionArn;
    awsEcsInfo.taskDefinitionVersion = object.taskDefinitionVersion;
    awsEcsInfo.status = object.status;
    awsEcsInfo.roleArn = object.roleArn;
    awsEcsInfo.execRoleArn = object.execRoleArn;
    awsEcsInfo.images = object.images;
    awsEcsInfo.capacityType = object.capacityType;
    return awsEcsInfo;
  }

  toJson (): AwsEcsInfoType {
    return {
      ...super.toJson(),
      region: this.region,
      clusterName: this.clusterName,
      serviceName: this.serviceName,
      serviceArn: this.serviceArn,
      clusterArn: this.clusterArn,
      runningCount: this.runningCount,
      desiredCount: this.desiredCount,
      capacity: this.capacity,
      asgArn: this.asgArn,
      asgName: this.asgName,
      memory: this.memory,
      cpu: this.cpu,
      taskDefinitionArn: this.taskDefinitionArn,
      taskDefinitionVersion: this.taskDefinitionVersion,
      status: this.status,
      roleArn: this.roleArn,
      execRoleArn: this.execRoleArn,
      images: this.images,
      capacityType: this.capacityType
    };
  }

  async getData (providers?: BaseProvider[]): Promise<void> {
    try {
      const awsCredentialsProvider = getAwsCredentialsProvider(providers);
      const credentials = await awsCredentialsProvider.getCredentials();
      const stsClient = new STS({
        credentials: credentials,
        region: this.region
      });
      const accountId = await stsClient.getCallerIdentity({}).then(res => res.Account).catch(e => console.error(e)) || '';
      const ecsClient = new ECS({
        credentials,
        region: this.region
      });
      const autoscalingClient = new AutoScaling({
        credentials,
        region: this.region
      });
      const {
        service,
        cluster
      } = await getCoreEcsData(ecsClient, this.clusterName, this.serviceName);
    
      const primaryDeployment = service?.deployments?.find((deployment) => {
        return deployment.status === 'PRIMARY';
      });
      this.taskDefinitionArn = primaryDeployment?.taskDefinition;
      this.serviceArn = service?.serviceArn;
      this.clusterArn = service?.clusterArn;
      this.runningCount = service?.runningCount;
      this.desiredCount = service?.desiredCount;
      this.status = service?.status;
      this.roleArn = service?.roleArn;

      const promises = [];
      promises.push(ecsClient.describeTaskDefinition({
        taskDefinition: service?.taskDefinition
      }));
      promises.push(ecsClient.describeCapacityProviders({
        capacityProviders: [get(cluster, 'defaultCapacityProviderStrategy[0].capacityProvider')]
      }));
      const secondarySettledPromises = (await Promise.allSettled(promises)).map((promise) => {
        if (promise.status === 'fulfilled') {
          return promise.value;
        }
        console.error(promise.reason);
        return undefined;
      });
      const describeTaskDefinitionRes = secondarySettledPromises[0] as DescribeTaskDefinitionCommandOutput;
      const describeCapacityProvidersRes = secondarySettledPromises[1] as DescribeCapacityProvidersCommandOutput;

      const taskDefinition = describeTaskDefinitionRes?.taskDefinition;
      this.taskDefinitionVersion = taskDefinition?.revision || 1;
      this.memory = taskDefinition?.memory;
      this.cpu = taskDefinition?.cpu;
      this.execRoleArn = taskDefinition?.executionRoleArn;

      const capacityProvider = get(describeCapacityProvidersRes, 'capacityProviders[0]');
      this.asgArn = capacityProvider?.autoScalingGroupProvider?.autoScalingGroupArn;
      if (this.asgArn) {
        this.asgName = getAsgNameFromArn(this.asgArn);
        const describeAutoScalingGroupsRes = await autoscalingClient.describeAutoScalingGroups({
          AutoScalingGroupNames: [this.asgName]
        });
        this.capacity = get(describeAutoScalingGroupsRes, 'AutoScalingGroups[0].DesiredCapacity', 0);
        this.capacityType = 'EC2';
      } else {
        this.capacity = primaryDeployment?.desiredCount;
        this.capacityType = 'Fargate';
      }

      this.images = hydrateImages(taskDefinition, accountId);
    } catch (e: any) {
      throw TinyStacksError.fromJson({
        message: 'Failed to get ECS info data!',
        status: e.status || e.$metadata?.status || 500,
        stack: e.stack
      });
    }
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
            label='Cluster'
            value={this.clusterName}
            href={ecsClusterArnToUrl(this.clusterArn)}
            copy={this.clusterArn}
          />
          <KeyValueStat
            label='Service'
            value={this.serviceName}
            href={ecsServiceArnToUrl(this.serviceArn)}
            copy={this.serviceArn}
          />
          <KeyValueStat
            label='Tasks Running/Desired'
            value={`${this.runningCount}/${this.desiredCount}`}
          />
          <KeyValueStat
            label='Active Task Def Id'
            value={getTaskDefIdFromArn(this.taskDefinitionArn)}
            href={ecsTaskDefinitionArnToUrl(this.taskDefinitionArn)}
            copy={this.taskDefinitionArn}
          />
          <KeyValueStat
            label='Active Task Def Version'
            value={`${this.taskDefinitionVersion}`}
          />
          { 
            this.cpu &&
              <KeyValueStat
                label='Provisioned CPU'
                value={this.cpu}
              />
          }
          { 
            this.memory &&
              <KeyValueStat
                label='Provisioned Memory'
                value={this.memory}
              />
          }
          <KeyValueStat
            label='Capacity'
            value={`${this.capacity} (${this.capacityType})`}
          />
          {
            this.asgArn && 
              <KeyValueStat
                label='ASG'
                value={this.asgName}
                href={asgArnToUrl(this.asgArn)}
                copy={this.asgArn}
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