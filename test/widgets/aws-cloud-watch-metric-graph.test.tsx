import { AwsCloudWatchMetricGraph, Metric } from '../../src/aws-widgets/aws-cloud-watch-metric-graph.js'
import { TimeUnit } from '../../src/ops-types.js';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';


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
        unit: TimeUnit.m
      }
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
      expect(thrownError.message).toEqual('Failed to get CloudWatch metrics!');
    }
  });
  it('should throw an error if providers is an empty array', async () => {
    let thrownError;
    try {
      await widget.getData([], mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('Failed to get CloudWatch metrics!');
    }
  });
  it('should throw an error if the first provider is not an AwsCredentialsProvider', async () => {
    let thrownError;
    try {
      await widget.getData([{ type: 'Not-AwsCredentialsProvider' }, mockProviders], mockOverrides)
    } catch (error) {
      thrownError = error;
    } finally {
      expect(thrownError.message).toEqual('Failed to get CloudWatch metrics!');
    }
  });
});

/*describe('AwsCloudWatchMetricGraph render', () => {   
  test('renders graph with correct datasets and options', () => {
    const mockOverridesCallback = jest.fn();
    const mockMetrics: Metric[] = [
      {
        metricName: 'Metric 1', 
        metricDisplayName: 'Metric 1',
        metricNamespace: 'ECS/ContainerInsights',
        dimensions: [
        { key: 'ClusterName', 
          value: 'cluster' }, 
        { key: 'ServiceName', 
         value: 'service' }
        ],
        data: [
          { timestamp: 1, value: 10, unit: 'ms' },
          { timestamp: 2, value: 20, unit: 'ms' },
        ],
      },
      {
      metricName: 'Metric 2', 
      metricDisplayName: 'Metric 2',
      metricNamespace: 'ECS/ContainerInsights',
      dimensions: [
      { key: 'ClusterName', 
        value: 'cluster' }, 
      { key: 'ServiceName', 
       value: 'service' }
    ],
        data: [
          { timestamp: 1, value: 5, unit: 'ms' },
          { timestamp: 2, value: 15, unit: 'ms' },
        ],
      },
    ];

    const props = {
      id: 'CW MockWidget',
      type: 'AwsCloudWatchMetricGraph',
      displayName: 'mock cw widget', 
      region: 'us-east-1', 
      timeRange: { 
        startTime: (Date.now() - ((7 * 24 * 60 * 60 * 1000))) , 
        endTime: Date.now()
      },
      metrics: mockMetrics } 

    const metricWidget = AwsCloudWatchMetricGraph.fromJson(props);
    const renderedWidget = metricWidget.render();
    render(renderedWidget);
  
    // Assert that the Line component is rendered
    expect(screen.getByRole('Line')).toBeInTheDocument();
  
    // Assert that the datasets are correctly passed to the Line component
    const lineComponent = screen.getByRole('Line');
    console.log("linecompoen: ", lineComponent);
    expect(lineComponent).toHaveProperty('data', {
      datasets: [
        {
          label: 'Metric 1',
          data: [
            { x: 1, y: 10, unit: 'ms' },
            { x: 2, y: 20, unit: 'ms' },
          ],
          borderColor: expect.any(String),
          pointRadius: 0,
          pointHoverRadius: 12,
          pointHitRadius: 10,
        },
        {
          label: 'Metric 2',
          data: [
            { x: 1, y: 5, unit: 'ms' },
            { x: 2, y: 15, unit: 'ms' },
          ],
          borderColor: expect.any(String),
          pointRadius: 0,
          pointHoverRadius: 12,
          pointHitRadius: 10,
        },
      ],
    });
  
    // Assert that overridesCallback was called with the expected arguments
    expect(mockOverridesCallback).toHaveBeenCalledWith({
      timeRange: expect.any(Object), // Add your expected value here
    });
  });
  

}); */
