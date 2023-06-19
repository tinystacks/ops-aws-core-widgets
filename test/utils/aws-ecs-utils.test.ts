import { ECS, Task, TaskDefinition, ContainerDefinition, PortMapping, KeyValuePair, Secret, Volume, DescribeServicesCommandOutput, DescribeClustersCommandOutput, ListTasksCommandOutput } from '@aws-sdk/client-ecs';
import { getCoreEcsData, getTasksForTaskDefinition, hydrateImages } from '../../src/utils/aws-ecs-utils';

describe('getCoreEcsData', () => {
  test('should return service, cluster, and taskArns', async () => {
    // Mock the ECS client methods
    const ecsClient = {
      describeServices: jest.fn().mockResolvedValue({ services: [{}] }),
      describeClusters: jest.fn().mockResolvedValue({ clusters: [{}] }),
      listTasks: jest.fn().mockResolvedValue({ taskArns: ['taskArn1', 'taskArn2'] })
    } as unknown as ECS;
    const clusterName = 'myCluster';
    const serviceName = 'myService';

    // Call the function
    const result = await getCoreEcsData(ecsClient, clusterName, serviceName);

    // Check the result
    expect(result.service).toBeDefined();
    expect(result.cluster).toBeDefined();
    expect(result.taskArns).toEqual(['taskArn1', 'taskArn2']);

    // Check that the ECS client methods were called with the correct parameters
    expect(ecsClient.describeServices).toHaveBeenCalledWith({
      cluster: clusterName,
      services: [ serviceName ]
    });
    expect(ecsClient.describeClusters).toHaveBeenCalledWith({
      clusters: [ clusterName ]
    });
    expect(ecsClient.listTasks).toHaveBeenCalledWith({
      cluster: clusterName,
      serviceName: serviceName
    });
  });

  test('should handle errors', async () => {
    // Mock the ECS client methods to throw errors
    const ecsClient = {
      describeServices: jest.fn().mockRejectedValue(new Error('describeServices error')),
      describeClusters: jest.fn().mockResolvedValue({ clusters: [{}] }),
      listTasks: jest.fn().mockResolvedValue({ taskArns: ['taskArn1', 'taskArn2'] })
    } as unknown as ECS;
    const clusterName = 'myCluster';
    const serviceName = 'myService';

    // Call the function
    const result = await getCoreEcsData(ecsClient, clusterName, serviceName);

    // Check the result
    expect(result.service).toBeUndefined();
    expect(result.cluster).toBeDefined();
    expect(result.taskArns).toEqual(['taskArn1', 'taskArn2']);

    // Check that the ECS client methods were called with the correct parameters
    expect(ecsClient.describeServices).toHaveBeenCalledWith({
      cluster: clusterName,
      services: [ serviceName ]
    });
    expect(ecsClient.describeClusters).toHaveBeenCalledWith({
      clusters: [ clusterName ]
    });
    expect(ecsClient.listTasks).toHaveBeenCalledWith({
      cluster: clusterName,
      serviceName: serviceName
    });
  });

});

describe('getTasksForTaskDefinition', () => {
  const tasks: Task[] = [
    {
      taskArn: 'task-1',
      taskDefinitionArn: 'task-def-1',
      containerInstanceArn: 'container-instance-1',
      createdAt: new Date(),
      startedAt: new Date(),
      stoppedAt: new Date(),
      group: 'group-1'
    },
    {
      taskArn: 'task-2',
      taskDefinitionArn: 'task-def-2',
      containerInstanceArn: 'container-instance-2',
      createdAt: new Date(),
      startedAt: new Date(),
      stoppedAt: new Date(),
      group: 'group-1'
    },
    {
      taskArn: 'task-3',
      taskDefinitionArn: 'task-def-1',
      containerInstanceArn: 'container-instance-3',
      createdAt: new Date(),
      startedAt: new Date(),
      stoppedAt: new Date(),
      group: 'group-2'
    }
  ];

  test('returns an array of tasks with matching taskDefinitionArn', () => {
    const result = getTasksForTaskDefinition(tasks, 'task-def-1');
    expect(result).toHaveLength(2);
    expect(result[0].taskArn).toEqual('task-1');
    expect(result[1].taskArn).toEqual('task-3');
  });

  test('returns an empty array if no tasks match taskDefinitionArn', () => {
    const result = getTasksForTaskDefinition(tasks, 'task-def-3');
    expect(result).toHaveLength(0);
  });
});

describe('hydrateImages', () => {
  const taskDefinition: TaskDefinition = {
    containerDefinitions: [
      {
        name: 'container1',
        portMappings: [{ containerPort: 80, protocol: 'tcp' }],
        environment: [{ name: 'ENV_VAR_1', value: 'value1' }],
        secrets: [],
        memory: 256,
        cpu: 128,
        logConfiguration: {
          options: {
            'awslogs-region': 'us-east-1',
            'awslogs-group': 'test-logs-group'
          }, 
          logDriver: ''
        }
      },
      {
        name: 'container2',
        portMappings: [{ containerPort: 443, protocol: 'tcp' }],
        environment: [{ name: 'ENV_VAR_2', value: 'value2' }],
        secrets: [],
        memory: 512,
        cpu: 256,
        logConfiguration: {
          options: {
            'awslogs-region': 'us-east-1',
            'awslogs-group': 'test-logs-group'
          }, 
          logDriver: ''
        }
      }
    ],
    volumes: []
  };

  const accountId = '123456789012';

  it('should return an empty array when given an empty task definition', () => {
    const containerDefinitions: ContainerDefinition[] = [];
    const taskDefinition = {containerDefinitions};
    const images = hydrateImages(taskDefinition, accountId);
    expect(images).toEqual([]);
  });

  it('should hydrate image data correctly', () => {
    const images = hydrateImages(taskDefinition, accountId);
    expect(images).toEqual([
      {
        containerId: 'container1',
        portMappings: [{ containerPort: 80, protocol: 'tcp' }],
        envVars: [{ name: 'ENV_VAR_1', value: 'value1' }],
        secrets: [],
        volumes: [],
        memory: 256,
        cpu: 128,
        cwLogsGroupArn: `arn:aws:logs:us-east-1:${accountId}:log-group:test-logs-group:*`
      },
      {
        containerId: 'container2',
        portMappings: [{ containerPort: 443, protocol: 'tcp' }],
        envVars: [{ name: 'ENV_VAR_2', value: 'value2' }],
        secrets: [],
        volumes: [],
        memory: 512,
        cpu: 256,
        cwLogsGroupArn: `arn:aws:logs:us-east-1:${accountId}:log-group:test-logs-group:*`
      }
    ]);
  });
});





