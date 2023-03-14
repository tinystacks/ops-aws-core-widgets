import { 
  ECS,
  Task,
  TaskDefinition,
  PortMapping,
  KeyValuePair,
  Secret,
  Volume,
  DescribeServicesCommandOutput,
  DescribeClustersCommandOutput,
  ListTasksCommandOutput
} from '@aws-sdk/client-ecs';
import _ from 'lodash';

export type Image = {
  containerId: string;
  portMappings: PortMapping[];
  envVars: KeyValuePair[];
  secrets: Secret[],
  volumes: Volume[],
  cwLogsArn: string,
  memory: number,
  cpu: number
}

export async function getCoreEcsData (ecsClient: ECS, clusterName: string, serviceName: string) {
  const promises = [];
  promises.push(ecsClient.describeServices({
    cluster: clusterName,
    services: [ serviceName ]
  }));
  promises.push(ecsClient.describeClusters({
    clusters: [ clusterName ]
  }));
  promises.push(ecsClient.listTasks({
    cluster: clusterName,
    serviceName: serviceName
  }));
  const settledPromises = (await Promise.allSettled(promises)).map((promise) => {
    if (promise.status === 'fulfilled') {
      return promise.value;
    }
    console.error(promise.reason);
    return undefined;
  });
  const service = _.get((settledPromises[0] as DescribeServicesCommandOutput), 'services[0]');
  const cluster = _.get((settledPromises[1] as DescribeClustersCommandOutput), 'clusters[0]');
  const taskArns = _.get((settledPromises[2] as ListTasksCommandOutput), 'taskArns');
 
  return {
    service,
    cluster,
    taskArns
  };
}

export function getTasksForTaskDefinition (tasks: Task[], taskDefinitionArn: string) {
  return tasks.filter(task => task.taskDefinitionArn === taskDefinitionArn);
}

export function hydrateImages (taskDefinition: TaskDefinition, accountId: string) {
  const images: Image[] = [];
  const containerDefinitions = taskDefinition?.containerDefinitions;
  containerDefinitions.forEach((containerDefinition) => {
    const logConfigOptions = containerDefinition?.logConfiguration?.options;
    images.push({
      containerId: containerDefinition?.name,
      portMappings: containerDefinition?.portMappings,
      envVars: containerDefinition?.environment,
      secrets: containerDefinition?.secrets,
      volumes: taskDefinition?.volumes,
      memory: containerDefinition?.memory,
      cwLogsArn: `arn:aws:logs:${logConfigOptions['awslogs-region']}:${accountId}:${logConfigOptions['awslogs-group']}:*`,
      cpu: containerDefinition.cpu
    });
  });

  return images;
}