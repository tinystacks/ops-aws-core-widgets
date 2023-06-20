import isEmpty from 'lodash.isempty';
import { Provider, Controllers, TinyStacksError } from '@tinystacks/ops-core';
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider.js';
import {
  getAwsCredentialsProvider,
  getTimes,
  cleanTimeRange,
  TimeRangeOverrides
} from '../utils/utils.js';
import { arnSplitter, isArn } from '../utils/arn-utils.js';
import { AwsCloudWatchLogs as AwsCloudWatchLogsProps } from '../ops-types.js';
import { AwsCloudWatchLogs as AwsCloudWatchLogsModel } from '../models/aws-cloud-watch-logs.js';

import Widget = Controllers.Widget;

type AwsCloudWatchLogsOverrides = TimeRangeOverrides;

export class AwsCloudWatchLogs extends AwsCloudWatchLogsModel implements Widget {

  static fromJson (object: AwsCloudWatchLogsProps): AwsCloudWatchLogs {
    return new AwsCloudWatchLogs(object);
  }

  async getData (providers?: Provider[], overrides?: AwsCloudWatchLogsOverrides): Promise<void> {
    try {
      if (!providers || isEmpty(providers) || providers[0].type !== 'AwsCredentialsProvider') {
        throw TinyStacksError.fromJson({
          message: 'An AwsCredentialsProvider was expected, but was not given',
          status: 400
        });
      }

      this.timeRange = cleanTimeRange(this.timeRange, overrides);

      const provider = getAwsCredentialsProvider(providers);

      const awsCredentialsProvider = provider as AwsCredentialsProvider;
      const cwLogsClient = new CloudWatchLogs({
        credentials: await awsCredentialsProvider.getCredentials(),
        region: this.region
      });

      const {
        startTime,
        endTime
      } = getTimes(this.timeRange);

      this.events = (await cwLogsClient.filterLogEvents({
        logGroupName: isArn(this.logGroupName) ? arnSplitter(this.logGroupName).resourceName : this.logGroupName,
        logStreamNames: this.logStreamName ? [this.logStreamName] : undefined,
        startTime: startTime.getTime(),
        endTime: endTime.getTime()
      })).events;

      // TODO: This ends up infinite looping when the timeframe is too wide. We prob wanna add a MaxItems field
      //       OR pass pagination back to the client and to getData as an override
      // let res = await cwLogsClient.getLogEvents({
      //   logStreamName: this.logStreamName,
      //   logGroupName: this.logGroupName,
      //   startTime: this.startTime,
      //   endTime: this.endTime
      // });
      // this.events = [...this.events, ...res.events];
      // while (res.nextForwardToken) {
      //   res = await cwLogsClient.getLogEvents({
      //     logStreamName: this.logStreamName,
      //     logGroupName: this.logGroupName,
      //     startTime: this.startTime,
      //     endTime: this.endTime,
      //     nextToken: res.nextForwardToken
      //   });
      //   this.events = [...this.events, ...res.events];
      // }
    } catch (e: any) {
      throw TinyStacksError.fromJson({
        message: 'Failed to get CloudWatch logs!',
        status: e.status || e.$metadata?.status || 500,
        stack: e.stack
      });
    }
  }
} 