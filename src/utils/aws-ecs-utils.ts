import { 
  ECS,
  Task,
  Container,
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
  containerName: string;
  portMappings: PortMapping[];
  envVars: KeyValuePair[];
  secrets: Secret[],
  volumes: Volume[],
  cwLogsArn: string,
  memory: string,
  cpu: string
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

export function hydrateImages (tasks: Task[], taskDefinition: TaskDefinition, accountId: string) {
  const images: Image[] = [];
  let containers: Container[] = [];
  tasks.forEach((task) => {
    containers = [...containers, ...task.containers];
  });
  containers.forEach((container) => {
    const containerDefinition = taskDefinition.containerDefinitions.find((containerDef) => {
      return containerDef.name === container.name;
    });
    const logConfigOptions = containerDefinition?.logConfiguration?.options;
    images.push({
      containerName: container.name,
      portMappings: containerDefinition?.portMappings,
      envVars: containerDefinition?.environment,
      secrets: containerDefinition?.secrets,
      volumes: taskDefinition?.volumes,
      memory: container.memory,
      cwLogsArn: `arn:aws:logs:${logConfigOptions['awslogs-region']}:${accountId}:${logConfigOptions['awslogs-group']}:*`,
      cpu: container.cpu
    });
  });

  return images;
}