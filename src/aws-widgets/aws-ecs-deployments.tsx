import { Widget } from '@tinystacks/ops-core';
import { Widget as WidgetType } from '@tinystacks/ops-model';
import { 
  ECS,
  Deployment as AwsDeployment,
  Task as AwsTask
} from '@aws-sdk/client-ecs';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider';
import { getCoreEcsData, getTasksForTaskDefinition, hydrateImages, Image } from '../utils/aws-ecs-utils';

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

type AwsEcsDeploymentsProps = WidgetType & {
  region: string;
  accountId: string;
  clusterName: string;
  serviceName: string;
}

type AwsEcsDeploymentsType = AwsEcsDeploymentsProps & {
  deployments: Deployment[];
}

export class AwsEcsDeployments extends Widget implements AwsEcsDeploymentsType {
  static type = 'AwsEcsDeployments';
  region: string;
  accountId: string;
  clusterName: string;
  serviceName: string;
  deployments: Deployment[];

  constructor (props: AwsEcsDeploymentsProps) {
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
    } = props;
    super (
      id,
      displayName,
      AwsEcsDeployments.type,
      providerId,
      showDisplayName,
      description,
      showDescription
    );
    this.region = region;
    this.accountId = accountId;
    this.clusterName = clusterName;
    this.serviceName = serviceName;
    this.deployments = [];
  }

  fromJson (object: AwsEcsDeploymentsType): AwsEcsDeployments {
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
      deployments
    } = object;

    const awsEcsDeployments = new AwsEcsDeployments({
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
    awsEcsDeployments.deployments = deployments;
    return awsEcsDeployments;
  }

  toJson (): AwsEcsDeploymentsType {
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

  async getData (): Promise<void> {
    const awsCredentialsProvider = this.provider as AwsCredentialsProvider;
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
    throw new Error('Method not implemented.');
  }
  
}