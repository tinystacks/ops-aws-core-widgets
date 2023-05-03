import { render, screen, cleanup } from '@testing-library/react';
import { AwsEcsDeployments } from '../../src/aws-widgets/aws-ecs-deployments.js'
import '@testing-library/jest-dom/extend-expect';

describe('AwsEcsDeployments', () => {
  afterEach(cleanup);
  
  describe('AwsEcsDeployments intialization', () => {
    it('AwsEcsDeployments is initialized successfully', () => {
      const props = {
        id: 'MockWidget',
        type: 'AwsEcsDeployments',
        displayName: 'mock widget', 
        region: 'us-east-1', 
        clusterName: 'cluster-name',
        serviceName: 'service-name'
      };
      
      const awsEcs = AwsEcsDeployments.fromJson(props);
      expect(awsEcs.toJson()).toStrictEqual({
        ...props,
        deployments: [],
        childrenIds: undefined,
        description: undefined,
        displayOptions: undefined,
        providerIds: undefined, 
      });
    });

  });

});


describe('AwsEcsDeployments getData function', () => {
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
    widget = new AwsEcsDeployments({
      id: 'MockWidget',
      type: 'AwsEcsDeployments',
      displayName: 'mock cw widget', 
      region: 'us-east-1', 
      clusterName: 'cluster-name',
      serviceName: 'service-name'
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw an error if providers is not an array or is empty', async () => {
    await expect(widget.getData(null, mockOverrides)).rejects.toThrow('No AwsCredentialsProvider provided');
    await expect(widget.getData([], mockOverrides)).rejects.toThrow('No AwsCredentialsProvider provided');
  });

  it('should throw an error if the first provider is not an AwsCredentialsProvider', async () => {
    mockProviders[0].type = 'NotAwsCredentialsProvider';
    await expect(widget.getData(mockProviders, mockOverrides)).rejects.toThrow('The passed in provider test-provider is not an AwsCredentialsProvider');
  });

});


describe('AwsEcsDeployments render', () => {
  const deployments = [
    {
      deploymentId: '123',
      status: 'RUNNING',
      startedAt: new Date('2022-01-01T00:00:00Z'),
      desiredCount: 2,
      runningCount: 1,
      pendingCount: 0,
      taskDefinition: {
        tasks: [
          {
            taskId: 'task-1',
            startTime: new Date('2022-01-01T00:00:00Z'),
            stopTime: null,
            status: 'RUNNING'
          },
          {
            taskId: 'task-2',
            startTime: new Date('2022-01-01T00:00:00Z'),
            stopTime: new Date('2022-01-01T00:01:00Z'),
            status: 'STOPPED'
          }
        ]
      }
    }
  ];

  it('renders deployments table', () => {
    const props = {
      id: 'MockWidget',
      type: 'AwsEcsDeployments',
      displayName: 'mock widget', 
      region: 'us-east-1', 
      clusterName: 'cluster-name',
      serviceName: 'service-name', 
      deployments
    };

    const ecsWidget = AwsEcsDeployments.fromJson(props);
    const renderedWidget = ecsWidget.render();
    render(renderedWidget);
    const deploymentId = screen.getByText('Deployment Id');
    const deploymentStatus = screen.getByText('Deployment Status');
    const started = screen.getAllByText('Started')[0];
    const runningPendingDesired = screen.getByText('Running/Pending/Desired');
    const killTaskBtn = screen.getAllByText('Kill task')[0];
    expect(deploymentId).toBeInTheDocument();
    expect(deploymentStatus).toBeInTheDocument();
    expect(started).toBeInTheDocument();
    expect(runningPendingDesired).toBeInTheDocument();
    expect(killTaskBtn).toBeInTheDocument();
  });

  it('calls overridesCallback when kill task button is clicked', () => {
    const mockOverridesCallback = jest.fn();
    const props = {
      id: 'MockWidget',
      type: 'AwsEcsDeployments',
      displayName: 'mock widget', 
      region: 'us-east-1', 
      clusterName: 'cluster-name',
      serviceName: 'service-name', 
      deployments
    };

    const ecsWidget = AwsEcsDeployments.fromJson(props);
    const renderedWidget = ecsWidget.render(undefined, mockOverridesCallback);
    render(renderedWidget);
    const killTaskBtn = screen.getAllByText('Kill task')[0];
    killTaskBtn.click();
    expect(mockOverridesCallback).toHaveBeenCalledTimes(1);
  });
});

