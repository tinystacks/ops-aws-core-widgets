import { Widget as WidgetType } from '@tinystacks/ops-model';
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { OutputLogEvents } from 'aws-sdk/clients/cloudwatchlogs';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider.js';
import { getAwsCredentialsProvider } from '../utils.js';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';

import React from 'react';

type AwsCloudWatchLogsProps = WidgetType & {
  region: string,
  logStreamName: string,
  logGroupName?: string,
  startTime?: number,
  endTime?: number,
  events: OutputLogEvents
}

export class AwsCloudWatchLogs extends BaseWidget {
  static type = 'AwsCloudWatchLogs';
  region: string;
  logStreamName: string;
  logGroupName?: string;
  startTime?: number;
  endTime?: number;
  events?: OutputLogEvents;

  constructor (args: AwsCloudWatchLogsProps) {
    super (args);
    this.region = args.region;
    this.logStreamName = args.logStreamName;
    this.logGroupName = args.logGroupName;
    this.startTime = args.startTime;
    this.endTime = args.endTime;
    this.events = args.events || [];
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
      startTime: this.startTime,
      endTime: this.endTime,
      events: this.events
    };
  }

  async getData (providers: BaseProvider[]): Promise<void> {
    const provider = getAwsCredentialsProvider(providers);

    const awsCredentialsProvider = provider as AwsCredentialsProvider;
    const cwLogsClient = new CloudWatchLogs({
      credentials: await awsCredentialsProvider.getCredentials(),
      region: this.region
    });
    let res = await cwLogsClient.getLogEvents({
      logStreamName: this.logStreamName,
      logGroupName: this.logGroupName,
      startTime: this.startTime,
      endTime: this.endTime
    });
    this.events = [...this.events, ...res.events];
    while (res.nextForwardToken) {
      res = await cwLogsClient.getLogEvents({
        logStreamName: this.logStreamName,
        logGroupName: this.logGroupName,
        startTime: this.startTime,
        endTime: this.endTime,
        nextToken: res.nextForwardToken
      });
      this.events = [...this.events, ...res.events];
    }
  }

  render (): React.ReactElement {
    function CloudWatchLogsComponent (props: { events: OutputLogEvents }) {
      return (
        <div>
          {props.events.map(event => event.message)}
        </div>
      );
    }

    return <CloudWatchLogsComponent events={this.events}/>;
  }
}