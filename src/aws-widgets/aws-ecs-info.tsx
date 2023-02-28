import { Widget as WidgetType } from "@tinystacks/ops-model"
import { Widget } from '@tinystacks/ops-core';
import { 
  ECS,
  DescribeTaskDefinitionCommandOutput,
  DescribeCapacityProvidersCommandOutput,
  DescribeTasksCommandOutput
} from '@aws-sdk/client-ecs';
import _ from 'lodash';
import { AwsCredentialsProvider } from "../aws-provider/aws-credentials-provider";
import { getCoreEcsData, getTasksForTaskDefinition, hydrateImages, Image } from "../utils/aws-ecs-utils";

type AwsEcsInfoProps = WidgetType & {
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

export class AwsEcsInfo extends Widget implements AwsEcsInfoType {
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
  images: Image[]

  constructor (props: AwsEcsInfoProps) {
    const {
      id,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      accountId,
      clusterName,
      serviceName
    } = props
    super (
      id,
      displayName,
      AwsEcsInfo.type,
      providerId,
      showDisplayName,
      description,
      showDescription
    );
    this.region = region;
    this.accountId = accountId;
    this.clusterName = clusterName;
    this.serviceName = serviceName;
  }

  fromJson(object: AwsEcsInfoType): AwsEcsInfo {
    const {
      id,
      displayName,
      type,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      accountId,
      clusterName,
      serviceName,
      serviceArn,
      clusterArn,
      runningCount,
      desiredCount,
      capacity,
      asgArn,
      memory,
      cpu,
      taskDefinitionArn,
      status,
      roleArn,
      execRoleArn,
      images
    } = object;
    const awsEcsInfo = new AwsEcsInfo({
      id,
      displayName,
      type,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      accountId,
      clusterName,
      serviceName
    });
    awsEcsInfo.serviceArn = serviceArn;
    awsEcsInfo.clusterArn = clusterArn;
    awsEcsInfo.runningCount = runningCount;
    awsEcsInfo.desiredCount = desiredCount;
    awsEcsInfo.capacity = capacity;
    awsEcsInfo.asgArn = asgArn;
    awsEcsInfo.memory = memory;
    awsEcsInfo.cpu = cpu;
    awsEcsInfo.taskDefinitionArn = taskDefinitionArn;
    awsEcsInfo.status = status;
    awsEcsInfo.roleArn = roleArn;
    awsEcsInfo.execRoleArn = execRoleArn;
    awsEcsInfo.images = images;
    
    return awsEcsInfo;
  }

  toJson(): AwsEcsInfoType {
    return {
      id: this.id,
      type: this.type,
      displayName: this.displayName,
      providerId: this.providerId,
      showDisplayName: this.showDisplayName,
      description: this.description,
      showDescription: this.showDescription,
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
    }
  }

  async getData(): Promise<void> {
    const awsCredentialsProvider = this.provider as AwsCredentialsProvider;
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

    const secondaryAwsPromises = [];
    secondaryAwsPromises.push(ecsClient.describeTaskDefinition({
      taskDefinition: service?.taskDefinition
    }));
    secondaryAwsPromises.push(ecsClient.describeCapacityProviders({
      capacityProviders: [ _.get(cluster, 'defaultCapacityProviderStrategy[0].capacityProvider') ]
    }));
    secondaryAwsPromises.push(ecsClient.describeTasks({
      cluster: this.clusterName,
      tasks: taskArns
    }));
    const secondarySettledPromises = (await Promise.allSettled(secondaryAwsPromises)).map((promise) => {
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
    this.capacity = capacityProvider?.autoScalingGroupProvider?.managedScaling?.targetCapacity

    const tasks = describeTasksRes?.tasks;
    const associatedTasks = getTasksForTaskDefinition(tasks, this.taskDefinitionArn);
    this.images = hydrateImages(associatedTasks, taskDefinition, this.accountId);
  }

  render(): JSX.Element {
    throw new Error("Method not implemented.");
  }
}