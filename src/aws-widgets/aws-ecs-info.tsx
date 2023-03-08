import { Widget } from '@tinystacks/ops-model';
import {
  ECS,
  DescribeTaskDefinitionCommandOutput,
  DescribeCapacityProvidersCommandOutput,
  DescribeTasksCommandOutput
} from '@aws-sdk/client-ecs';
import _ from 'lodash';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { getAwsCredentialsProvider } from '../utils/utils.js';
import { getCoreEcsData, getTasksForTaskDefinition, hydrateImages, Image } from '../utils/aws-ecs-utils.js';
import { Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';

type AwsEcsInfoProps = Widget & {
  region: string,
  accountId: string,
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
  accountId: string;
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

  constructor (props: AwsEcsInfoProps) {
    const {
      region,
      accountId,
      clusterName,
      serviceName
    } = props;
    super (
      props
    );
    this.region = region;
    this.accountId = accountId;
    this.clusterName = clusterName;
    this.serviceName = serviceName;
  }

  static fromJson (object: AwsEcsInfoProps): AwsEcsInfo {
    return new AwsEcsInfo(object);
  }

  toJson (): AwsEcsInfoType {
    return {
      ...super.toJson(),
      region: this.region,
      accountId: this.accountId,
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
    const ecsClient = new ECS({
      credentials: await awsCredentialsProvider.getCredentials(),
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
    this.images = hydrateImages(associatedTasks, taskDefinition, this.accountId);
  }

  render (): JSX.Element {
    const imageRows = this.images.map((image) => {
      return (
        <Tr>
          <Td>{image.containerName}</Td>
          <Td>{image.portMappings.length}</Td>
          <Td>{image.envVars.length}</Td>
          <Td>{image.volumes[0].name}</Td>
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
                <Th>CPORT MAPPING</Th>
                <Th>ENV VARIABLES</Th>
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