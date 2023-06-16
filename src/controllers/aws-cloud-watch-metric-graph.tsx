import isEmpty from 'lodash.isempty';
import { CloudWatch } from '@aws-sdk/client-cloudwatch';
import { Controllers, Provider, TinyStacksError } from '@tinystacks/ops-core';
import { AwsSdkVersionEnum } from '../aws-provider/aws-credentials/aws-credentials-type.js';
import {
  getAwsCredentialsProvider,
  getTimes,
  TimeRangeOverrides,
  cleanTimeRange,
  getPeriodBasedOnTimeRange
} from '../utils/utils.js';
import { AwsCloudWatchMetricGraph as AwsCloudWatchMetricGraphType } from '../ops-types.js';
import { AwsCloudWatchMetricGraph as AwsCloudWatchMetricGraphModel } from '../models/aws-cloud-watch-metric-graph.js';

import Widget = Controllers.Widget; 

type AwsCloudWatchMetricGraphOverrides = TimeRangeOverrides;

type AwsCloudWatchMetricGraphProps = AwsCloudWatchMetricGraphType & {
  showTimeRangeSelector?: boolean;
  showPeriodSelector?: boolean;
};

export class AwsCloudWatchMetricGraph extends AwsCloudWatchMetricGraphModel implements Widget {
  static fromJson (object: AwsCloudWatchMetricGraphProps): AwsCloudWatchMetricGraph {
    return new AwsCloudWatchMetricGraph(object);
  }

  async getData (providers?: Provider[], overrides?: AwsCloudWatchMetricGraphOverrides): Promise<void> {
    try {
      if (!providers || isEmpty(providers) || providers[0].type !== 'AwsCredentialsProvider') {
        throw TinyStacksError.fromJson({
          message: 'An AwsCredentialsProvider was expected, but was not given',
          status: 400
        });
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
    } catch (e: any) {
      throw TinyStacksError.fromJson({
        message: 'Failed to get CloudWatch metrics!',
        status: e.status || e.$metadata?.status || 500,
        stack: e.stack
      });
    }
  }
}