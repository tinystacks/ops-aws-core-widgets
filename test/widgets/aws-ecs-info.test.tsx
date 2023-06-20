import { AwsEcsInfo } from '../../src/controllers/aws-ecs-info.js'
import { AwsEcsInfo as AwsEcsInfoView } from '../../src/views/aws-ecs-info.js'
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

describe('AwsEcsInfo', () => {
  afterEach(cleanup);
  
  describe('AwsEcsInfo intialization', () => {
    it('AwsEcsInfo is initialized successfully', () => {
      const props = {
        id: 'MockWidget',
        type: 'AwsEcsInfo',
        displayName: 'mock cw widget', 
        region: 'us-east-1', 
        clusterName: 'cluster-name',
        serviceName: 'service-name'
      };
      
      const awsEcsInfo = new AwsEcsInfo(props);
      expect(awsEcsInfo.toJson()).toStrictEqual({
        ...props,
        childrenIds: undefined,
        description: undefined,
        displayOptions: undefined,
        providerIds: undefined, 
        serviceArn: undefined,
        clusterArn: undefined,
        runningCount: undefined,
        desiredCount: undefined,
        capacity: undefined,
        asgArn: undefined,
        memory: undefined,
        cpu: undefined,
        taskDefinitionArn: undefined,
        status: undefined,
        roleArn: undefined,
        execRoleArn: undefined,
        images: undefined, 
        capacityType: undefined
      });
    });

  });

});


describe('AwsEcsInfo getData function', () => {
  let mockProviders;
  let mockOverrides;
  let widget;

  beforeEach(() => {
    mockProviders = [
      {
        type: 'AwsCredentialsProvider',
        id: 'test-provider',
        getCredentials: jest.fn().mockResolvedValue({
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
          sessionToken: 'sessionToken'
        })
      }
    ];
    mockOverrides = {};
    widget = new AwsEcsInfo({
      id: 'MockWidget',
      type: 'AwsEcsInfo',
      displayName: 'mock widget', 
      region: 'us-east-1', 
      clusterName: 'cluster-name',
      serviceName: 'service-name', 
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw an error if providers is nil', async () => {
    let thrownError;
    try {
      await widget.getData(null, mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('Failed to get ECS info data!');
    }
  });
  it('should throw an error if providers is an empty array', async () => {
    let thrownError;
    try {
      await widget.getData([], mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('Failed to get ECS info data!');
    }
  });
  it('should throw an error if the first provider is not an AwsCredentialsProvider', async () => {
    let thrownError;
    try {
      await widget.getData([{ type: 'Not-AwsCredentialsProvider' }, mockProviders], mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('Failed to get ECS info data!');
    }
  });

});


describe('AwsEcsInfo render', () => {
  const props = {
    id: 'MockWidget',
    type: 'AwsEcsInfo',
    displayName: 'mock cw widget', 
    region: 'us-east-1', 
    clusterName: 'cluster-name',
    serviceName: 'service-name',
    clusterArn: 'clusterArn',
    serviceArn:'serviceArn',
    runningCount: 2,
    desiredCount: 3,
    taskDefinitionArn: 'taskDefinitionArn',
    status: 'status',
    roleArn: 'roleArn', 
    execRoleArn: 'execRoleArn',
    asgArn: 'asgArn',
    cpu: 'cpu',
    memory:'memory',
    capacity: 5,
    capacityType: undefined,
    images:  [{
      containerId: 'containerId1',
      volumes: [{ name: 'volume1' }, { name: 'volume2' }],
      cwLogsGroupArn: 'cwLogsGroupArn1',
      portMappings: [],
      envVars: [],
      secrets: [], 
      memory: 1024, 
      cpu: 1024
    },
    {
      containerId: 'containerId2',
      volumes: [{ name: 'volume3' }],
      cwLogsGroupArn: 'cwLogsGroupArn2', 
      portMappings: [],
      envVars: [],
      secrets: [], 
      memory: 1024, 
      cpu: 1024
    }
  ]};


  beforeEach(() => {
    const ecsWidget = AwsEcsInfoView.fromJson(props);
    const renderedWidget = ecsWidget.render();
    render(renderedWidget);
  });

  test('renders container ids', () => {
    const containerIds = screen.getAllByText(/containerid/i);
    expect(containerIds).toHaveLength(props.images.length);
    expect(containerIds[0]).toHaveTextContent(props.images[0].containerId);
    expect(containerIds[1]).toHaveTextContent(props.images[1].containerId);
  });

  test('renders volumes', () => {
    const volumes = screen.getAllByText(/volume/i);
    expect(volumes).toHaveLength(3);
  });

  test('renders view logs links', () => {
    const viewLogsLinks = screen.getAllByText(/view logs/i);
    expect(viewLogsLinks).toHaveLength(3); //cell plus the two anchor elements
  });
});



