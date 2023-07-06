import { AwsCloudWatchLogs } from '../../src/controllers/aws-cloud-watch-logs.js'
import { AwsCloudWatchLogs as AwsCloudWatchLogsView } from '../../src/views/aws-cloud-watch-logs.js'
import { TimeUnit } from '../../src/ops-types.js';
import { render, cleanup, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

describe('AwsCloudWatchLogs', () => {
  afterEach(cleanup);
  
  describe('Cloud watch logs intialization', () => {
    it('cw logs is initialized successfully', () => {
      const props = {
        id: 'MockWidget',
        type: 'AwsCloudWatchLogs',
        displayName: 'mock cw widget', 
        region: 'us-east-1', 
        timeRange: { 
          startTime: (Date.now() - ((7 * 24 * 60 * 60 * 1000))) , 
          endTime: Date.now()
        },
        logGroupName: 'groupName', 
      };
      
      const cwLogs = AwsCloudWatchLogs.fromJson(props);
      expect(cwLogs.toJson()).toStrictEqual({
        ...props,
        logStreamName: undefined,
        events: [],
        childrenIds: undefined,
        description: undefined,
        displayOptions: undefined,
        providerIds: undefined, 
      });
    });

  });

});


describe('AwsCloudWatchLogs getData function', () => {
  let mockProviders;
  let mockOverrides;
  let widget;

  beforeEach(() => {
    mockProviders = [
      {
        type: 'AwsCredentialsProvider',
        getCredentials: () => ({
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
          sessionToken: 'sessionToken'
        })
      }
    ];
    mockOverrides = {};
    widget = new AwsCloudWatchLogs({
      id: 'MockWidget',
      type: 'AwsCloudWatchLogs',
      displayName: 'mock widget', 
      region: 'us-east-1', 
      showTimeRangeSelector: true,
      timeRange: {
        time: 5,
        unit: TimeUnit.m
      },
      logGroupName: 'test-group-name'
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
      expect(thrownError.message).toEqual('Failed to get CloudWatch logs!');
    }
  });
  it('should throw an error if providers is an empty array', async () => {
    let thrownError;
    try {
      await widget.getData([], mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('Failed to get CloudWatch logs!');
    }
  });
  it('should throw an error if the first provider is not an AwsCredentialsProvider', async () => {
    let thrownError;
    try {
      await widget.getData([{ type: 'Not-AwsCredentialsProvider' }, mockProviders], mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('Failed to get CloudWatch logs!');
    }
  });

});

describe('AwsCloudWatchLogs render', () => {
  test('renders events correctly', () => {

    const props = {
      id: 'MockWidget',
      type: 'AwsCloudWatchLogs',
      displayName: 'mock cw widget', 
      region: 'us-east-1', 
      timeRange: { 
        startTime: (Date.now() - ((7 * 24 * 60 * 60 * 1000))) , 
        endTime: Date.now()
      },
      logGroupName: 'groupName', 
      events: [
      {
        timestamp: 1683147148723,
        message: 'Event 1',
      },
      {
        timestamp: 1683060748723,
        message: 'Event 2',
      }]
    };

    const cwWidget = AwsCloudWatchLogsView.fromJson(props);
    const renderedWidget = cwWidget.render();
    render(renderedWidget);

      // Check that the events are rendered correctly
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
  });

  test('renders "no logs" message when events list is empty', () => {
    const props = {
      id: 'MockWidget',
      type: 'AwsCloudWatchLogs',
      displayName: 'mock cw widget', 
      region: 'us-east-1', 
      timeRange: { 
        startTime: (Date.now() - ((7 * 24 * 60 * 60 * 1000))) , 
        endTime: Date.now()
      },
      logGroupName: 'groupName', 
      events: []
    };

    const cwWidget = AwsCloudWatchLogsView.fromJson(props);
    const renderedWidget = cwWidget.render();
    render(renderedWidget);

    // Check that the "no logs" message is rendered
    expect(screen.getByText('There are no logs in this logGroup and logStream during this timeframe')).toBeInTheDocument();
  });

});
