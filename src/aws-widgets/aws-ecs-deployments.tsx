import React from 'react';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { Widget } from '@tinystacks/ops-model';
import { 
  ECS,
  Deployment as AwsDeployment,
  Task as AwsTask
} from '@aws-sdk/client-ecs';
import { getCoreEcsData, getTasksForTaskDefinition, hydrateImages, Image } from '../utils/aws-ecs-utils.js';
import { getAwsCredentialsProvider } from '../utils/utils.js';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';

type Task = {
  taskId?: string;
  startTime?: Date;
  stopTime?: Date;
  status?: string;
  group?: string;
  version?: number;
  cwLogsArn?: string;
}

type TaskDefinition = {
  taskDefinitionArn?: string;
  cpu?: string;
  memory?: string;
  roleArn?: string;
  execRoleArn?: string;
  containers?: Image[];
  tasks?: Task[];
}

type Deployment = {
  deploymentId?: string;
  status?: string;
  startTime?: Date;
  runningCount?: number;
  pendingCount?: number;
  desiredCount?: number;
  taskDefinition?: TaskDefinition;
}

type AwsEcsDeploymentsProps = Widget & {
  region: string;
  accountId: string;
  clusterName: string;
  serviceName: string;
}

type AwsEcsDeploymentsType = AwsEcsDeploymentsProps & {
  deployments?: Deployment[];
}

export class AwsEcsDeployments extends BaseWidget {
  static type = 'AwsEcsDeployments';
  region: string;
  accountId: string;
  clusterName: string;
  serviceName: string;
  deployments?: Deployment[];

  constructor (props: AwsEcsDeploymentsType) {
    super (props);
    this.region = props.region;
    this.accountId = props.accountId;
    this.clusterName = props.clusterName;
    this.serviceName = props.serviceName;
    this.deployments = props.deployments || [];
  }

  static fromJson (object: AwsEcsDeploymentsType): AwsEcsDeployments {
    return new AwsEcsDeployments(object);
  }

  toJson (): AwsEcsDeploymentsType {
    return {
      ...super.toJson(),
      region: this.region,
      accountId: this.accountId,
      clusterName: this.clusterName,
      serviceName: this.serviceName,
      deployments: this.deployments
    };
  }

  private async hydrateDeployment (ecsClient: ECS, awsDeployment: AwsDeployment, awsTasks: AwsTask[], accountId: string) {
    const deployment: Deployment = {
      deploymentId: awsDeployment.id,
      status: awsDeployment.status,
      startTime: awsDeployment.createdAt,
      runningCount: awsDeployment.runningCount,
      pendingCount: awsDeployment.pendingCount,
      desiredCount: awsDeployment.desiredCount
    };
    const describeTaskDefinitionRes = await ecsClient.describeTaskDefinition({
      taskDefinition: awsDeployment.taskDefinition
    });
    const taskDefinition = describeTaskDefinitionRes?.taskDefinition;
    const associatedAwsTasks = getTasksForTaskDefinition(awsTasks, awsDeployment.taskDefinition);
    const tasks = associatedAwsTasks.map((task) => {
      return {
        taskId: task.taskArn?.split('/').at(-1),
        startTime: task.startedAt,
        stopTime: task.stoppedAt,
        status: task.lastStatus,
        group: task.group,
        version: task.version
      } as Task;
    });
    const containers = hydrateImages(associatedAwsTasks, taskDefinition, accountId);
    deployment.taskDefinition = {
      taskDefinitionArn: awsDeployment.taskDefinition,
      cpu: taskDefinition?.cpu,
      memory: taskDefinition?.memory,
      roleArn: taskDefinition?.taskRoleArn,
      execRoleArn: taskDefinition?.executionRoleArn,
      tasks,
      containers
    };

    return deployment;
  }

  async getData (providers?: BaseProvider[]): Promise<void> {
    const awsCredentialsProvider = getAwsCredentialsProvider(providers);
    const ecsClient = new ECS({
      credentials: await awsCredentialsProvider.getCredentials(),
      region: this.region
    });

    const {
      service,
      taskArns
    } = await getCoreEcsData(ecsClient, this.clusterName, this.serviceName);

    const describeTasksRes = await ecsClient.describeTasks({
      cluster: this.clusterName,
      tasks: taskArns
    });
    const tasks = describeTasksRes.tasks;

    const deploymentPromises: Promise<Deployment>[] = [];
    service.deployments.forEach((deployment) => {
      deploymentPromises.push(this.hydrateDeployment(ecsClient, deployment, tasks, this.accountId));
    });
    const settledPromises = (await Promise.allSettled(deploymentPromises)).reduce((filtered, promise) => {
      if (promise.status === 'fulfilled') {
        filtered.push(promise.value);
      } else {
        console.error(promise.reason);
      }
      return filtered;
    }, []);

    this.deployments = settledPromises;
  }

  render (): JSX.Element {
    // map deployments list
    // map tasks

    const deploymentRows = this.deployments.map((deployment) => {
      const taskRows = deployment.taskDefinition.tasks.map((task) => {
        return (
          <Tr>
            <Td>{task.taskId}</Td>
            <Td>{task.startTime.toLocaleString()}</Td>
            <Td>{task.stopTime.toLocaleString()}</Td>
            <Td>{task.status}</Td>
            <Td>{task.group}</Td>
            <Td>{task.version}</Td>
          </Tr>
        );
      });
      const taskTable = (
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>TASK ID</Th>
              <Th>STARTED</Th>
              <Th>STOPPED</Th>
              <Th>STATUS</Th>
              <Th>GROUP</Th>
              <Th>VERSION</Th>
            </Tr>
          </Thead>
          <Tbody>
            {taskRows}
          </Tbody>
        </Table>
      );
      const taskDefinition = (
        <Accordion allowMultiple>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <TableContainer>
                  <Table variant='simple'>
                    <Thead>
                      <Tr>
                        <Th>TASK DEFINITION</Th>
                        <Th>CPU LIMITS</Th>
                        <Th>MEMORY LIMITS</Th>
                        <Th>ROLE ARN</Th>
                        <Th>EXECUTION ROLE ARN</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>{deployment.taskDefinition.taskDefinitionArn}</Td>
                        <Td>{deployment.taskDefinition.cpu}</Td>
                        <Td>{deployment.taskDefinition.memory}</Td>
                        <Td>{deployment.taskDefinition.roleArn}</Td>
                        <Td>{deployment.taskDefinition.execRoleArn}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel>
              {taskTable}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      );

      return (
        <Tr>
          <Accordion allowMultiple>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Td>{deployment.deploymentId}</Td>
                  <Td>{deployment.status}</Td>
                  <Td>{deployment.startTime.toLocaleString()}</Td>
                  <Td>{deployment.runningCount} / {deployment.pendingCount} / {deployment.desiredCount}</Td>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                {taskDefinition}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Tr>
      );
    });

    return (
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>DEPLOYMENT ID</Th>
              <Th>DEPLOYMENT STATUS</Th>
              <Th>STARTED</Th>
              <Th>RUNNING / PENDING / DESIRED</Th>
            </Tr>
          </Thead>
          <Tbody>
            {deploymentRows}
          </Tbody>
        </Table>
      </TableContainer>
    );

    return ( 
      <Stack>
        <Box bg='tomato' w='100%' p={4} color='white'>
          This is the Box
        </Box>
      </Stack>
    );
  }
  
}