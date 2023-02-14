import { CloudWatch } from '@aws-sdk/client-cloudwatch';
import dayjs, { ManipulateType } from 'dayjs';
import { Widget as WidgetType } from '@tinystacks/ops-model';
// TODO: Add ops-core dependency, import from ops-core
import { Widget } from '@tinystacks/ops-core';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider';
import { LocalAwsProfile } from '../aws-provider/aws-credentials/local-aws-profile';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type';

// eslint-disable-next-line no-shadow
enum TimeUnitEnum {
  ns = 'ns',
  ms = 'ms',
  s = 's',
  m = 'm',
  h = 'h',
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

export class AwsCloudWatchMetricGraph extends Widget implements AwsCloudWatchMetricGraphType {
  static type = 'AwsCloudWatchMetricGraph';
  statistic: string;
  showTimeRangeSelector: boolean;
  showStatisticSelector: boolean;
  showPeriodSelector: boolean;
  metrics: Metric[];
  timeRange: TimeRange | RelativeTime;
  region: string;

  constructor (
    id: string,
    displayName: string,
    providerId: string,
    showDisplayName?: boolean,
    description?: string,
    showDescription?: boolean,
    statistic = 'Average',
    showTimeRangeSelector = true,
    showStatisticSelector = true,
    showPeriodSelector = true,
    metrics: Metric[] = [],
    timeRange: TimeRange | RelativeTime = {
      time: 5,
      unit: TimeUnitEnum.m
    },
    region = 'us-east-1'
  ) {
    super (
      id,
      displayName,
      AwsCloudWatchMetricGraph.type,
      providerId,
      showDisplayName,
      description,
      showDescription
    );
    this.statistic = statistic;
    this.showTimeRangeSelector = showTimeRangeSelector;
    this.showStatisticSelector = showStatisticSelector;
    this.showPeriodSelector = showPeriodSelector;
    this.metrics = metrics;
    this.timeRange = timeRange;
    this.region = region;
  }
  additionalProperties?: any;

  static fromJson (object: AwsCloudWatchMetricGraphType): AwsCloudWatchMetricGraph {
    const {
      id,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      statistic,
      showTimeRangeSelector,
      showStatisticSelector,
      showPeriodSelector,
      metrics,
      timeRange,
      region
    } = object;
    return new AwsCloudWatchMetricGraph(
      id!,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      statistic,
      showTimeRangeSelector,
      showStatisticSelector,
      showPeriodSelector,
      metrics,
      timeRange,
      region
    );
  }

  toJson (): AwsCloudWatchMetricGraphType {
    return {
      id: this.id,
      type: this.type,
      displayName: this.displayName,
      providerId: this.providerId,
      showDisplayName: this.showDisplayName,
      description: this.description,
      showDescription: this.showDescription,
      statistic: this.statistic,
      showTimeRangeSelector: this.showTimeRangeSelector,
      showStatisticSelector: this.showStatisticSelector,
      showPeriodSelector: this.showPeriodSelector,
      metrics: this.metrics,
      timeRange: this.timeRange,
      region: this.region
    };
  }

  async getData (): Promise<void> {
    // Start DELETEME
    // Remove once provider plugin is integrated
    const awsCredentialsProvider = this.provider as unknown as AwsCredentialsProvider;
    const providerThatWorks = new AwsCredentialsProvider({
      id: awsCredentialsProvider.id, 
      credentials: new LocalAwsProfile({ 
        profileName: (awsCredentialsProvider.credentials as any).profileName 
      })
    });
    // END DELETEME
    const cwClient = new CloudWatch({
      credentials: await providerThatWorks.getCredentials(AwsSdkVersionEnum.V3),
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

  render() {
    throw new Error('Method not implemented.');
  }
  
}
