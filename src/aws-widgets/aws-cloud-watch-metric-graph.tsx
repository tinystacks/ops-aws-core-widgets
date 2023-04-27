import get from 'lodash.get';
import isEmpty from 'lodash.isempty';
import React from 'react';
import { CloudWatch } from '@aws-sdk/client-cloudwatch';
import { Widget } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type.js';
import { getAwsCredentialsProvider, getTimes, TimeUnitEnum, TimeRange, TimeRangeOverrides, cleanTimeRange, getPeriodBasedOnTimeRange } from '../utils/utils.js';
import { Box, Stack } from '@chakra-ui/react';
import { TimeRangeSelector } from '../components/time-range-selector.js';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, Chart, LineElement, TooltipItem, TooltipModel
} from 'chart.js';

Chart.register(
  CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement
);
// taken from: https://stackoverflow.com/questions/55300288/react-chartjs-2-vertical-line-when-hovering-over-chart/71943022#71943022
Chart.register(
  {
    id: 'vertLineThroughDataPoints', //typescript crashes without id
    afterDraw: function (chart: any) {
      if (chart.tooltip._active && chart.tooltip._active.length) {
        const activePoint = chart.tooltip._active[0];
        const ctx = chart.ctx;
        const x = activePoint.element.x;
        const topY = chart.scales.y.top;
        const bottomY = chart.scales.y.bottom;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, bottomY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.stroke();
        ctx.restore();
      }
    }
  }
);


export enum MetricColors {
  RED = '#F56565',
  BLUE = '#4299E1',
  ORANGE = '#ED8936',
  GREEN = '#68D391'
}


const metricColorPattern = [
  MetricColors.RED,
  MetricColors.BLUE,
  MetricColors.ORANGE,
  MetricColors.GREEN
];

type KeyValuePair = {
  key: string;
  value: string;
}

type MetricData = {
  value: number;
  unit: string;
  timestamp: number;
}

type Metric = {
  metricNamespace: string;
  metricName: string;
  metricDisplayName: string;
  statistic?: string;
  dimensions: KeyValuePair[];
  data?: MetricData[];
}
type AwsCloudWatchMetricGraphOverrides = TimeRangeOverrides;

type AwsCloudWatchMetricGraphProps = Widget & AwsCloudWatchMetricGraphOverrides & {
  showTimeRangeSelector?: boolean;
  showPeriodSelector?: boolean;
  metrics: Metric[];
  region: string;
};

export class AwsCloudWatchMetricGraph extends BaseWidget {
  static type = 'AwsCloudWatchMetricGraph';
  showTimeRangeSelector: boolean;
  showPeriodSelector: boolean;
  metrics: Metric[];
  timeRange: TimeRange;
  region: string;

  constructor (props: AwsCloudWatchMetricGraphProps) {
    super (props);
    const {
      showTimeRangeSelector, showPeriodSelector, metrics, timeRange, region
    } = props;
    this.showTimeRangeSelector = showTimeRangeSelector;
    this.showPeriodSelector = showPeriodSelector;
    this.metrics = metrics;
    this.timeRange = timeRange || {
      time: 5,
      unit: TimeUnitEnum.m
    };
    this.region = region || 'us-east-1';
  }
  additionalProperties?: any;

  static fromJson (object: AwsCloudWatchMetricGraphProps): AwsCloudWatchMetricGraph {
    return new AwsCloudWatchMetricGraph(object);
  }

  toJson (): AwsCloudWatchMetricGraphProps {
    return {
      ...super.toJson(),
      showTimeRangeSelector: this.showTimeRangeSelector,
      showPeriodSelector: this.showPeriodSelector,
      metrics: this.metrics,
      timeRange: this.timeRange,
      region: this.region
    };
  }

  async getData (providers?: BaseProvider[], overrides?: AwsCloudWatchMetricGraphOverrides): Promise<void> {
    if (!providers || isEmpty(providers) || providers[0].type !== 'AwsCredentialsProvider') {
      throw new Error('An AwsCredentialsProvider was expected, but was not given');
    }

    this.timeRange = cleanTimeRange(this.timeRange, overrides);

    const awsCredentialsProvider = getAwsCredentialsProvider(providers);
    const cwClient = new CloudWatch({
      credentials: await awsCredentialsProvider.getCredentials(AwsSdkVersionEnum.V3),
      region: this.region
    });
    
    const { 
      startTime,
      endTime
    } = getTimes(this.timeRange);

    const period = getPeriodBasedOnTimeRange(startTime, endTime);

    const hydratedMetrics = [];
    for (const metric of this.metrics) {
      const metricStatsResponse = await cwClient.getMetricStatistics({
        Namespace: metric.metricNamespace,
        MetricName: metric.metricName,
        Dimensions: metric.dimensions.map(dimension => ({
          Name: dimension.key,
          Value: dimension.value
        })),
        Statistics: [metric.statistic || 'Average'],
        Period: period,
        StartTime: startTime,
        EndTime: endTime
      });
      const {
        Datapoints = []
      } = metricStatsResponse;
      metric.data = Datapoints
        .map(datapoint  => ({
          value: Number((datapoint as any)[metric.statistic || 'Average']),
          unit: datapoint.Unit || '',
          timestamp: (datapoint.Timestamp || new Date()).getTime()
        }))
        .sort((dp1, dp2) => dp1.timestamp - dp2.timestamp);

      hydratedMetrics.push(metric);
    }

    this.metrics = hydratedMetrics;
  }

  render (_children?: any, overridesCallback?: (overrides: AwsCloudWatchMetricGraphOverrides) => void): JSX.Element {

    // this is a map of all the timestamps to each datapoint
    // Sort by timestamp before render.
    const datasets = this.metrics.map((m: Metric, index: number) => {
      return {
        label: m.metricDisplayName,
        data: (m.data || [])
          // .sort((d1: MetricData, d2: MetricData) => d1.timestamp - d2.timestamp)
          .map((d: MetricData)=> ({
            x: d.timestamp,
            y: d.value,
            unit: d.unit
          })),
        borderColor: metricColorPattern[index % metricColorPattern.length],
        pointRadius: 0,
        pointHoverRadius: 12,
        pointHitRadius: 10
      };
    });

    const graph = (
      <Line
        datasetIdKey='label'
        data={{
          datasets
        }}
        options={{
          scales: {
            x: {
              type: 'linear',
              grace: '5%',
              ticks: {
                callback: function (label) {
                  return new Date(label).toLocaleString();
                },
                minRotation: 15
              }
            },
            y: {
              type: 'linear',
              grace: '5%'
            }
          },
          hover: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            colors: {
              enabled: true
            },
            tooltip: {
              callbacks: {
                title: function (this: TooltipModel<'line'>, items: TooltipItem<'line'>[]) {
                  return items.map(i => new Date(get(i.raw, 'x')).toLocaleString());
                },
                label: function (this: TooltipModel<'line'>, item: TooltipItem<'line'>) {
                  const datasetLabel = item.dataset.label || '';
                  const dataPoint = item.formattedValue;
                  return datasetLabel + ': ' + dataPoint + ' ' + get(item.raw, 'unit');
                }
              },
              mode: 'index',
              intersect: false
            },
            legend: {
              display: true,
              position: 'bottom'
            }
          }
        }}
      />
    );
    return (
      <Stack w='100%' p='20px'>
        <Box>
          <TimeRangeSelector
            timeRange={this.timeRange}
            updateTimeRange={timeRange => overridesCallback({ timeRange })}
          />
        </Box>
        <Box maxW='500px' maxH='300px'>
          {graph}
        </Box>
      </Stack>
    );
  }
}