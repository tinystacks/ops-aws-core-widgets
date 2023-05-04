import { AwsCloudWatchMetricGraph } from '../../src/aws-widgets/aws-cloud-watch-metric-graph.js'
import { TimeUnitEnum } from '../../src/utils/utils.js';
import { cleanup } from '@testing-library/react';


describe('AwsCloudWatchMetricGraph', () => {
  afterEach(cleanup);
  
  describe('Metric graph intialization', () => {
    it('Metric graph is initialized successfully', () => {
      const props = {
        id: 'CW MockWidget',
        type: 'AwsCloudWatchMetricGraph',
        displayName: 'mock cw widget', 
        region: 'us-east-1', 
        timeRange: { 
          startTime: (Date.now() - ((7 * 24 * 60 * 60 * 1000))) , 
          endTime: Date.now()
        },
        metrics: [
          {
            metricName: 'MemoryUtilized', 
            metricDisplayName: 'Synth Memory Util',
            metricNamespace: 'ECS/ContainerInsights',
            dimensions: [
            { key: 'ClusterName', 
              value: 'cluster' }, 
            { key: 'ServiceName', 
             value: 'service' }
          ]
        }
        ]
      };
      
      const cli = AwsCloudWatchMetricGraph.fromJson(props);
      expect(cli.toJson()).toStrictEqual({
        ...props,
        showTimeRangeSelector: undefined, 
        showPeriodSelector: undefined,
        childrenIds: undefined,
        description: undefined,
        displayOptions: undefined,
        providerIds: undefined, 
      });
    });

  });
});

describe('AwsCloudWatchMetricGraph getData function', () => {
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
    widget = new AwsCloudWatchMetricGraph({
      id: 'CW MockWidget',
      type: 'AwsCloudWatchMetricGraph',
      displayName: 'mock cw widget', 
      region: 'us-east-1', 
      showTimeRangeSelector: true,
      showPeriodSelector: true,
      metrics: [
        {
          metricNamespace: 'namespace',
          metricName: 'name',
          metricDisplayName: 'display name',
          dimensions: [{ key: 'key', value: 'value' }],
        }
      ],
      timeRange: {
        time: 5,
        unit: TimeUnitEnum.m
      },
      period: 60
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
