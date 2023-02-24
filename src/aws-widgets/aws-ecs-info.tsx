import { Widget as WidgetType } from '@tinystacks/ops-model';
import {
  ECS,
  PortMapping,
  KeyValuePair,
  Secret,
  Volume,
  Container,
  DescribeServicesCommandOutput,
  DescribeClustersCommandOutput,
  ListTasksCommandOutput,
  DescribeTaskDefinitionCommandOutput,
  DescribeCapacityProvidersCommandOutput,
  DescribeTasksCommandOutput
} from '@aws-sdk/client-ecs';
import _ from 'lodash';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { getAwsCredentialsProvider } from '../utils.js';

type Image = {
  containerName: string;
  portMappings: PortMapping[];
  envVars: KeyValuePair[];
  secrets: Secret[],
  volumes: Volume[],
  cwLogsArn: string,
  memory: string,
  cpu: string
}

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

  fromJson (object: AwsEcsInfoProps): AwsEcsInfo {
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
    const initialAwsPromises = [];
    initialAwsPromises.push(ecsClient.describeServices({
      cluster: this.clusterName,
      services: [this.serviceName]
    }));
    initialAwsPromises.push(ecsClient.describeClusters({
      clusters: [this.clusterName]
    }));
    initialAwsPromises.push(ecsClient.listTasks({
      cluster: this.clusterName,
      serviceName: this.serviceName
    }));
    const initialSettledPromises = (await Promise.allSettled(initialAwsPromises)).map((promise) => {
      if (promise.status === 'fulfilled') {
        return promise.value;
      }
      console.error(promise.reason);
      return undefined;
    });
    const describeServicesRes = initialSettledPromises[0] as DescribeServicesCommandOutput;
    const describeClustersRes = initialSettledPromises[1] as DescribeClustersCommandOutput;
    const listTasksRes = initialSettledPromises[2] as ListTasksCommandOutput;

    const service = _.get(describeServicesRes, 'services[0]');
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

    const cluster = _.get(describeClustersRes, 'clusters[0]');
    secondaryAwsPromises.push(ecsClient.describeCapacityProviders({
      capacityProviders: [_.get(cluster, 'defaultCapacityProviderStrategy[0].capacityProvider')]
    }));

    const taskArns = listTasksRes?.taskArns;
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
    if (taskDefinition) {
      this.memory = taskDefinition.memory;
      this.cpu = taskDefinition.cpu;
      this.execRoleArn = taskDefinition.executionRoleArn;
    }

    const capacityProvider = _.get(describeCapacityProvidersRes, 'capacityProviders[0]');
    if (capacityProvider) {
      this.asgArn = capacityProvider?.autoScalingGroupProvider?.autoScalingGroupArn;
      this.capacity = capacityProvider?.autoScalingGroupProvider?.managedScaling?.targetCapacity;
    }

    const allTasks = describeTasksRes?.tasks;
    if (allTasks) {
      const tasks = allTasks?.filter(task => task.taskDefinitionArn === this.taskDefinitionArn);
      let containers: Container[] = [];
      tasks.forEach((task) => {
        containers = [...containers, ...task.containers];
      });
      this.images = [];
      containers.forEach((container) => {
        const containerDefinition = taskDefinition.containerDefinitions.find((cd) => {
          return cd.name === container.name;
        });
        const logConfigOptions = containerDefinition?.logConfiguration?.options;
        this.images.push({
          containerName: container.name,
          portMappings: containerDefinition?.portMappings,
          envVars: containerDefinition?.environment,
          secrets: containerDefinition?.secrets,
          volumes: taskDefinition?.volumes,
          memory: container.memory,
          cwLogsArn: `arn:aws:logs:${logConfigOptions['awslogs-region']}:${this.accountId}:${logConfigOptions['awslogs-group']}:*`,
          cpu: container.cpu
        });
      });
    }
  }

  render (): JSX.Element {
    throw new Error('Method not implemented.');
  }
}