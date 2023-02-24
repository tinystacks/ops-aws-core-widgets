import { CloudWatch } from '@aws-sdk/client-cloudwatch';
import dayjs, { ManipulateType } from 'dayjs';
import { Widget } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type';
import { h, Fragment } from 'preact';
import isEmpty from 'lodash.isempty';

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

type AwsCloudWatchMetricGraphProps = Widget & {
  statistic?: string;
  showTimeRangeSelector?: boolean;
  showStatisticSelector?: boolean;
  showPeriodSelector?: boolean;
  metrics: Metric[];
  timeRange?: TimeRange | RelativeTime;
  region: string;
}

export class AwsCloudWatchMetricGraph extends BaseWidget{
  static type = 'AwsCloudWatchMetricGraph';
  statistic: string;
  showTimeRangeSelector: boolean;
  showStatisticSelector: boolean;
  showPeriodSelector: boolean;
  metrics: Metric[];
  timeRange: TimeRange | RelativeTime;
  region: string;

  constructor (props: AwsCloudWatchMetricGraphProps) {
    super (props);
    this.statistic = props.statistic || 'Average';
    this.showTimeRangeSelector = props.showTimeRangeSelector || true;
    this.showStatisticSelector = props.showStatisticSelector || true;
    this.showPeriodSelector = props.showPeriodSelector || true;
    this.metrics = props.metrics || [];
    this.timeRange = props.timeRange || { time: 5, unit: TimeUnitEnum.m };
    this.region = props.region || 'us-east-1';
  }
  additionalProperties?: any;

  static fromJson (object: AwsCloudWatchMetricGraphProps): AwsCloudWatchMetricGraph {
    return new AwsCloudWatchMetricGraph(object);
  }

  toJson (): AwsCloudWatchMetricGraphProps {
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

  async getData (providers?: BaseProvider[]): Promise<void> {
    if (!providers || isEmpty(providers) || providers[0].type !== 'AwsCredentialsProvider') {
      throw new Error('An AwsCredentialsProvider was expected, but was not given');
    } 
    const awsProvider = BaseProvider.fromJson(providers[0]) as AwsCredentialsProvider;
    const cwClient = new CloudWatch({
      credentials: await awsProvider.getCredentials(AwsSdkVersionEnum.V3),
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
    }
  }

  render (): JSX.Element { return <>TODO</>; }
}