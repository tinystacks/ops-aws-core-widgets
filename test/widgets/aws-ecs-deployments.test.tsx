import { render, screen, cleanup } from '@testing-library/react';
import { AwsEcsDeployments } from '../../src/controllers/aws-ecs-deployments.js'
import { AwsEcsDeployments as AwsEcsDeploymentsViews } from '../../src/views/aws-ecs-deployments.js'
import '@testing-library/jest-dom/extend-expect';
import { Deployment } from '../../src/models/aws-ecs-deployments.js';

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

  it('should throw an error if providers is nil', async () => {
    let thrownError;
    try {
      await widget.getData(null, mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('Failed to get ECS deployments data!');
    }
  });
  it('should throw an error if providers is an empty array', async () => {
    let thrownError;
    try {
      await widget.getData([], mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('Failed to get ECS deployments data!');
    }
  });
  it('should throw an error if the first provider is not an AwsCredentialsProvider', async () => {
    let thrownError;
    try {
      await widget.getData([{ type: 'Not-AwsCredentialsProvider' }, mockProviders], mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('Failed to get ECS deployments data!');
    }
  });

});


describe('AwsEcsDeployments render', () => {
  const deployments: Deployment[] = [
    {
      deploymentId: '123',
      status: 'RUNNING',
      startTime: new Date('2022-01-01T00:00:00Z'),
      runningCount: 1,
      pendingCount: 0,
      desiredCount: 2,
      taskDefinition: {
        tasks: [
          {
            taskId: 'task-1',
            startTime: new Date('2022-01-01T00:00:00Z'),
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

    const ecsWidget = AwsEcsDeploymentsViews.fromJson(props);
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

    const ecsWidget = AwsEcsDeploymentsViews.fromJson(props);
    const renderedWidget = ecsWidget.render(undefined, mockOverridesCallback);
    render(renderedWidget);
    const killTaskBtn = screen.getAllByText('Kill task')[0];
    killTaskBtn.click();
    expect(mockOverridesCallback).toHaveBeenCalledTimes(1);
  });
});

