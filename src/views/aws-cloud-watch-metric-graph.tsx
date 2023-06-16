import React from 'react';
import get from 'lodash.get';
import { Views } from '@tinystacks/ops-core';
import { Box, Stack } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, Chart, LineElement, TooltipItem, TooltipModel
} from 'chart.js';
import { TimeRangeOverrides } from '../utils/utils.js';
import { TimeRangeSelector } from './components/time-range-selector.js';
import { AwsCloudWatchMetricGraph as AwsCloudWatchMetricGraphType, Metric, MetricData } from '../ops-types.js';
import { AwsCloudWatchMetricGraph as AwsCloudWatchMetricGraphModel } from '../models/aws-cloud-watch-metric-graph.js';

import Widget = Views.Widget;

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

type AwsCloudWatchMetricGraphOverrides = TimeRangeOverrides;

type AwsCloudWatchMetricGraphProps = AwsCloudWatchMetricGraphType & {
  showTimeRangeSelector?: boolean;
  showPeriodSelector?: boolean;
};

export class AwsCloudWatchMetricGraph extends AwsCloudWatchMetricGraphModel implements Widget {
  static fromJson (object: AwsCloudWatchMetricGraphProps): AwsCloudWatchMetricGraph {
    return new AwsCloudWatchMetricGraph(object);
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