import { cleanup } from '@testing-library/react';
import { AwsCloudWatchLogs } from '../../src/aws-widgets/aws-cloud-watch-logs.js'
import { TimeUnitEnum } from '../../src/utils/utils';

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
        getCredentials: jest.fn().mockResolvedValue({
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
        unit: TimeUnitEnum.m
      },
      logGroupName: 'test-group-name'
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw an error if providers is not an array or is empty', async () => {
    await expect(widget.getData(null, mockOverrides)).rejects.toThrow('An AwsCredentialsProvider was expected, but was not given');
    await expect(widget.getData([], mockOverrides)).rejects.toThrow('An AwsCredentialsProvider was expected, but was not given');
  });

  it('should throw an error if the first provider is not an AwsCredentialsProvider', async () => {
    mockProviders[0].type = 'NotAwsCredentialsProvider';
    await expect(widget.getData(mockProviders, mockOverrides)).rejects.toThrow('An AwsCredentialsProvider was expected, but was not given');
  });

});
