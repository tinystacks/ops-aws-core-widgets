import get from 'lodash.get';
import {
  ECS,
  DescribeTaskDefinitionCommandOutput,
  DescribeCapacityProvidersCommandOutput
} from '@aws-sdk/client-ecs';
import { STS } from '@aws-sdk/client-sts';
import { AutoScaling } from '@aws-sdk/client-auto-scaling';
import { Controllers, Provider, TinyStacksError } from '@tinystacks/ops-core';
import { getAwsCredentialsProvider } from '../utils/utils.js';
import { getCoreEcsData, hydrateImages } from '../utils/aws-ecs-utils.js';
import { getAsgNameFromArn } from '../utils/arn-utils.js';
import { AwsEcsInfo as AwsEcsInfoModel, AwsEcsInfoType } from '../models/aws-ecs-info.js';

import Widget = Controllers.Widget;

export class AwsEcsInfo extends AwsEcsInfoModel implements Widget {
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

  async getData (providers?: Provider[]): Promise<void> {
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
}