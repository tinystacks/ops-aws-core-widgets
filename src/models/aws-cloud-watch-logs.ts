import { Models } from '@tinystacks/ops-core';
import { OutputLogEvent } from '@aws-sdk/client-cloudwatch-logs';
import {
  AwsCloudWatchLogs as AwsCloudWatchLogsProps,
  TimeRange,
  TimeUnit
} from '../ops-types.js';

import Widget = Models.Widget;

export class AwsCloudWatchLogs extends Widget {
  static type = 'AwsCloudWatchLogs';
  region: string;
  logGroupName: string;
  logStreamName?: string;
  timeRange: TimeRange;
  showTimeRangeSelector?: boolean;
  events?: OutputLogEvent[];

  constructor (props: AwsCloudWatchLogsProps) {
    super(props);
    this.region = props.region;
    this.logStreamName = props.logStreamName;
    this.logGroupName = props.logGroupName;
    this.timeRange = props.timeRange || {
      time: 5,
      unit: TimeUnit.m
    };
    this.showTimeRangeSelector = props.showTimeRangeSelector || false;
    this.events = props.events || [];
  }

  static fromJson (object: AwsCloudWatchLogsProps): AwsCloudWatchLogs {
    return new AwsCloudWatchLogs(object);
  }

  toJson (): AwsCloudWatchLogsProps {
    return {
      ...super.toJson(),
      region: this.region,
      logStreamName: this.logStreamName,
      logGroupName: this.logGroupName,
      timeRange: this.timeRange,
      events: this.events
    };
  }
} 