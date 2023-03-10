import React from 'react';
import { Widget } from '@tinystacks/ops-model';
import {
  ECS,
  DescribeTaskDefinitionCommandOutput,
  DescribeCapacityProvidersCommandOutput,
  DescribeTasksCommandOutput
} from '@aws-sdk/client-ecs';
import { STS } from '@aws-sdk/client-sts';
import _ from 'lodash';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { getAwsCredentialsProvider } from '../utils/utils.js';
import { getCoreEcsData, getTasksForTaskDefinition, hydrateImages, Image } from '../utils/aws-ecs-utils.js';
import { Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';

type AwsEcsInfoProps = Widget & {
  region: string,
  clusterName: string,
  serviceName: string
}

type AwsEcsInfoType = AwsEcsInfoProps & {
  serviceArn: string;
  clusterArn: string;
  runningCount: number;
  desiredCount: number;
  capacity: number;
  asgArn: string;
  memory: string;
  cpu: string;
  taskDefinitionArn: string,
  status: string;
  roleArn: string;
  execRoleArn: string;
  images: Image[];
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
  memory: string;
  cpu: string;
  taskDefinitionArn: string;
  status: string;
  roleArn: string;
  execRoleArn: string;
  images: Image[];

  constructor (props: AwsEcsInfoType) {
    super(props);
    this.region = props.region;
    this.clusterName = props.clusterName;
    this.serviceName = props.serviceName;
    this.serviceArn = props.serviceArn;
    this.clusterArn = props.clusterArn;
    this.runningCount = props.runningCount;
    this.desiredCount = props.desiredCount;
    this.capacity = props.capacity;
    this.asgArn = props.asgArn;
    this.memory = props.memory;
    this.cpu = props.cpu;
    this.taskDefinitionArn = props.taskDefinitionArn;
    this.status = props.status;
    this.roleArn = props.roleArn;
    this.execRoleArn = props.execRoleArn;
    this.images = props.images;
  }

  static fromJson (object: AwsEcsInfoType): AwsEcsInfo {
    return new AwsEcsInfo(object);
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
      memory: this.memory,
      cpu: this.cpu,
      taskDefinitionArn: this.taskDefinitionArn,
      status: this.status,
      roleArn: this.roleArn,
      execRoleArn: this.execRoleArn,
      images: this.images
    };
  }

  async getData (providers?: BaseProvider[]): Promise<void> {
    const awsCredentialsProvider = getAwsCredentialsProvider(providers);
    const credentials = await awsCredentialsProvider.getCredentials();
    const stsClient = new STS({
      credentials: credentials,
      region: this.region
    });
    const accountId = await stsClient.getCallerIdentity({}).then(res => res.Account).catch(e => console.log(e)) || '';
    const ecsClient = new ECS({
      credentials,
      region: this.region
    });
    const {
      service,
      cluster,
      taskArns
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
      capacityProviders: [_.get(cluster, 'defaultCapacityProviderStrategy[0].capacityProvider')]
    }));
    promises.push(ecsClient.describeTasks({
      cluster: this.clusterName,
      tasks: taskArns
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
    const describeTasksRes = secondarySettledPromises[2] as DescribeTasksCommandOutput;

    const taskDefinition = describeTaskDefinitionRes?.taskDefinition;
    this.memory = taskDefinition?.memory;
    this.cpu = taskDefinition?.cpu;
    this.execRoleArn = taskDefinition?.executionRoleArn;

    const capacityProvider = _.get(describeCapacityProvidersRes, 'capacityProviders[0]');
    this.asgArn = capacityProvider?.autoScalingGroupProvider?.autoScalingGroupArn;
    this.capacity = capacityProvider?.autoScalingGroupProvider?.managedScaling?.targetCapacity;

    const tasks = describeTasksRes?.tasks;
    const associatedTasks = getTasksForTaskDefinition(tasks, this.taskDefinitionArn);
    this.images = hydrateImages(associatedTasks, taskDefinition, accountId);
  }

  render (): JSX.Element {
    const imageRows = this.images?.map((image) => {
      const portMappings = (image?.portMappings?.map(portMapping =>
        `${portMapping.hostPort}:${portMapping.containerPort}`
      ));
      const portMappingsString = portMappings ? portMappings.join('\n') : undefined;
      const envVars = (image?.envVars?.map(envVar =>
        `${envVar.name}: ${envVar.value}`
      ));
      const envVarsString = envVars ? envVars.join('\n') : undefined;
      const secrets = (image?.secrets?.map(secret =>
        `${secret.name}: ${secret.valueFrom}`
      ));
      const secretsString = secrets ? secrets.join('\n') : undefined;
      return (
        <Tr>
          <Td>{image?.containerName}</Td>
          <Td>{portMappingsString}</Td>
          <Td>{envVarsString}</Td>
          <Td>{secretsString}</Td>
          <Td>{_.get(image, 'volumes[0].name')}</Td>
        </Tr>
      );
    });
    return (
      <Stack>
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>SERVICE ARN</Th>
                <Th>CLUSTER ARN</Th>
                <Th>TASKS RUNNING/DESIRED</Th>
                <Th>CAPACITY</Th>
                <Th>ACTIVE TASK DEF ARN</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>{this.serviceArn}</Td>
                <Td>{this.clusterArn}</Td>
                <Td>{this.runningCount}/{this.desiredCount}</Td>
                <Td>{this.capacity}</Td>
                <Td>{this.taskDefinitionArn}</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
        <TableContainer>
          <Table variant='simple'>
            <Thead>
              <Tr>
                <Th>CONTAINER ID</Th>
                <Th>PORT MAPPINGS</Th>
                <Th>ENV VARIABLES</Th>
                <Th>SECRETS</Th>
                <Th>VOLUME</Th>
                <Th>View logs</Th>
              </Tr>
            </Thead>
            <Tbody>
              {imageRows}
            </Tbody>
          </Table>
        </TableContainer>
      </Stack>
    );
  }
}