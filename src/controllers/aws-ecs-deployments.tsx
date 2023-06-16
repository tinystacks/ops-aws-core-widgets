import isEmpty from 'lodash.isempty';
import { Controllers, Provider, TinyStacksError } from '@tinystacks/ops-core';
import {
  ECS,
  Deployment as AwsDeployment,
  Task as AwsTask
} from '@aws-sdk/client-ecs';
import { STS } from '@aws-sdk/client-sts';
import {
  getCoreEcsData,
  getTasksForTaskDefinition,
  hydrateImages
} from '../utils/aws-ecs-utils.js';
import { getAwsCredentialsProvider } from '../utils/utils.js';
import { AwsEcsDeployments as AwsEcsDeploymentsModel, AwsEcsDeploymentsOverrides, AwsEcsDeploymentsType, Deployment, Task } from '../models/aws-ecs-deployments.js';

import Widget = Controllers.Widget;

export class AwsEcsDeployments extends AwsEcsDeploymentsModel implements Widget {
  static fromJson (object: AwsEcsDeploymentsType): AwsEcsDeployments {
    return new AwsEcsDeployments(object);
  }

  private async hydrateDeployment (
    ecsClient: ECS,
    awsDeployment: AwsDeployment,
    awsTasks: AwsTask[],
    accountId: string
  ) {
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
    const associatedAwsTasks = getTasksForTaskDefinition(
      awsTasks,
      awsDeployment.taskDefinition
    );
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
    const containers = hydrateImages(taskDefinition, accountId);
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

  async getData (
    providers?: Provider[],
    overrides?: AwsEcsDeploymentsOverrides
  ): Promise<void> {
    try {
      const awsCredentialsProvider = getAwsCredentialsProvider(providers);
      const credentials = await awsCredentialsProvider.getCredentials();
      const stsClient = new STS({
        credentials: credentials,
        region: this.region
      });
      const accountId =
        (await stsClient
          .getCallerIdentity({})
          .then(res => res.Account)
          .catch(e => console.error(e))) || '';
      const ecsClient = new ECS({
        credentials,
        region: this.region
      });

      if (overrides?.stoppedTaskId) {
        console.log(`KILLING ${overrides.stoppedTaskId}`);
        await ecsClient.stopTask({
          task: overrides.stoppedTaskId,
          cluster: this.clusterName
        });
      }

      const { service, taskArns } = await getCoreEcsData(
        ecsClient,
        this.clusterName,
        this.serviceName
      );

      let tasks: AwsTask[] = [];
      if (!isEmpty(taskArns)) {
        const describeTasksRes = await ecsClient.describeTasks({
          cluster: this.clusterName,
          tasks: taskArns
        });
        tasks = describeTasksRes.tasks;
      }

      const deploymentPromises: Promise<Deployment>[] = [];
      service.deployments.forEach((deployment) => {
        deploymentPromises.push(
          this.hydrateDeployment(ecsClient, deployment, tasks, accountId)
        );
      });
      const settledPromises = (
        await Promise.allSettled(deploymentPromises)
      ).reduce((filtered, promise) => {
        if (promise.status === 'fulfilled') {
          filtered.push(promise.value);
        } else {
          console.error(promise.reason);
        }
        return filtered;
      }, []);

      this.deployments = settledPromises;
    } catch (e: any) {
      throw TinyStacksError.fromJson({
        message: 'Failed to get ECS deployments data!',
        status: e.status || e.$metadata?.status || 500,
        stack: e.stack
      });
    }
  }
}