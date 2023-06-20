import { Models } from '@tinystacks/ops-core';
import {
  TimeRange,
  TimeUnit,
  AwsCloudWatchMetricGraph as AwsCloudWatchMetricGraphType,
  Metric
} from '../ops-types.js';

import Widget = Models.Widget; 

type AwsCloudWatchMetricGraphProps = AwsCloudWatchMetricGraphType & {
  showTimeRangeSelector?: boolean;
  showPeriodSelector?: boolean;
};

export class AwsCloudWatchMetricGraph extends Widget {
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
      unit: TimeUnit.m
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
}