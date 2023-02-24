import { CloudWatch } from '@aws-sdk/client-cloudwatch';
import dayjs, { ManipulateType } from 'dayjs';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type.js';
import { getAwsCredentialsProvider } from '../utils.js';
import { Widget as WidgetType } from '@tinystacks/ops-model';
import { BaseWidget } from '@tinystacks/ops-core';
import { BaseProvider } from '@tinystacks/ops-core';

import React from 'react';

// eslint-disable-next-line no-shadow
enum TimeUnitEnum {
  ns = 'ns',
  ms = 'ms',
  s = 's',
  m = 'm',
  hr = 'h',
  d = 'd',
  w = 'w',
  mo = 'mo',
  yr = 'yr'
}

type KeyValuePair = {
  key: string;
  value: string;
}

type MetricData = {
  value: number;
  unit: string;
}

type Metric = {
  metricNamespace: string;
  metricName: string;
  metricDisplayName: string;
  dimensions: KeyValuePair[];
  data: MetricData[];
}

type TimeRange = {
  startTime: number;
  endTime: number;
}

type RelativeTime = {
  time: number;
  unit: TimeUnitEnum;
}

type AwsCloudWatchMetricGraphType = WidgetType & {
  statistic?: string;
  showTimeRangeSelector?: boolean;
  showStatisticSelector?: boolean;
  showPeriodSelector?: boolean;
  metrics: Metric[];
  timeRange?: TimeRange | RelativeTime;
  region: string;
}

export class AwsCloudWatchMetricGraph extends BaseWidget {
  static type = 'AwsCloudWatchMetricGraph';
  statistic: string;
  showTimeRangeSelector: boolean;
  showStatisticSelector: boolean;
  showPeriodSelector: boolean;
  metrics: Metric[];
  timeRange: TimeRange | RelativeTime;
  region: string;

  constructor (props: AwsCloudWatchMetricGraphType) {
    super (props);
    const {
      statistic, showTimeRangeSelector, showStatisticSelector, showPeriodSelector, metrics, timeRange, region
    } = props;
    this.statistic = statistic || 'Average';
    this.showTimeRangeSelector = showTimeRangeSelector;
    this.showStatisticSelector = showStatisticSelector;
    this.showPeriodSelector = showPeriodSelector;
    this.metrics = metrics;
    this.timeRange = timeRange || {
      time: 5,
      unit: TimeUnitEnum.m
    };
    this.region = region || 'us-east-1';
  }
  additionalProperties?: any;

  static fromJson (object: AwsCloudWatchMetricGraphType): AwsCloudWatchMetricGraph {
    return new AwsCloudWatchMetricGraph(object);
  }

  toJson (): AwsCloudWatchMetricGraphType {
    return {
      ...super.toJson(),
      statistic: this.statistic,
      showTimeRangeSelector: this.showTimeRangeSelector,
      showStatisticSelector: this.showStatisticSelector,
      showPeriodSelector: this.showPeriodSelector,
      metrics: this.metrics,
      timeRange: this.timeRange,
      region: this.region
    };
  }

  async getData (providers: BaseProvider[]): Promise<void> {
    const awsCredentialsProvider = getAwsCredentialsProvider(providers);
    const cwClient = new CloudWatch({
      credentials: await awsCredentialsProvider.getCredentials(AwsSdkVersionEnum.V3),
      region: this.region
    });
    let startTime;
    let endTime;
    const abosluteTimeRange = this.timeRange as TimeRange;
    if (abosluteTimeRange.startTime && abosluteTimeRange.endTime) {
      startTime = new Date(abosluteTimeRange.startTime);
      endTime = new Date(abosluteTimeRange.endTime);
    } else {
      const now = dayjs();
      const relativeTimeRange = this.timeRange as RelativeTime;
      const relativeTimeStart = now.subtract(relativeTimeRange.time, relativeTimeRange.unit as ManipulateType);
      endTime = now.toDate();
      startTime = relativeTimeStart.toDate();
    }

    const hydratedMetrics = [];
    for (const metric of this.metrics) {
      const metricStatsResponse = await cwClient.getMetricStatistics({
        Namespace: metric.metricNamespace,
        MetricName: metric.metricName,
        Dimensions: metric.dimensions.map(dimension => ({
          Name: dimension.key,
          Value: dimension.value
        })),
        Statistics: [this.statistic],
        Period: 60,
        StartTime: startTime,
        EndTime: endTime
      });
      const {
        Datapoints = []
      } = metricStatsResponse;
      metric.data = Datapoints.map(datapoint => ({
        value: Number((datapoint as any)[this.statistic]),
        unit: datapoint.Unit || ''
      }));

      hydratedMetrics.push(metric);
    }

    this.metrics = hydratedMetrics;
  }

  render (): JSX.Element { return <>{JSON.stringify(this.metrics.map(m => m.data))}</>; }
}