import { Widget as WidgetType } from '@tinystacks/ops-model';
import { Widget } from '@tinystacks/ops-core';
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { OutputLogEvents } from 'aws-sdk/clients/cloudwatchlogs';
import { h, Fragment } from 'preact';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider';

type AwsCloudWatchLogsProps = WidgetType & {
  region: string,
  logStreamName: string,
  logGroupName?: string,
  startTime?: number,
  endTime?: number
}

type AwsCloudWatchLogsType = AwsCloudWatchLogsProps & {
  events: OutputLogEvents
}

export class AwsCloudWatchLogs extends Widget implements AwsCloudWatchLogsType {
  static type = 'AwsCloudWatchLogs';
  region: string;
  logStreamName: string;
  logGroupName?: string;
  startTime?: number;
  endTime?: number;
  events: OutputLogEvents;

  constructor (args: AwsCloudWatchLogsProps) {
    const {
      id,
      displayName,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      logStreamName,
      logGroupName,
      startTime,
      endTime
    } = args;
    super (
      id,
      displayName,
      AwsCloudWatchLogs.type,
      providerId,
      showDisplayName,
      description,
      showDescription
    );
    this.region = region;
    this.logStreamName = logStreamName;
    this.logGroupName = logGroupName;
    this.startTime = startTime;
    this.endTime = endTime;
    this.events = [];
  }

  // take full type for full serialization, set others explicitly
  fromJson (object: AwsCloudWatchLogsProps): AwsCloudWatchLogs {
    const {
      id,
      displayName,
      type,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      logStreamName,
      logGroupName,
      startTime,
      endTime
    } = object;
    return new AwsCloudWatchLogs({
      id,
      displayName,
      type,
      providerId,
      showDisplayName,
      description,
      showDescription,
      region,
      logStreamName,
      logGroupName,
      startTime,
      endTime
    });
  } 

  toJson (): AwsCloudWatchLogsType {
    return {
      id: this.id,
      type: this.type,
      displayName: this.displayName,
      providerId: this.providerId,
      showDisplayName: this.showDisplayName,
      description: this.description,
      showDescription: this.showDescription,
      region: this.region,
      logStreamName: this.logStreamName,
      logGroupName: this.logGroupName,
      startTime: this.startTime,
      endTime: this.endTime,
      events: this.events
    };
  }

  async getData (): Promise<void> {
    const awsCredentialsProvider = this.provider as AwsCredentialsProvider;
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

  render (): JSX.Element { return <>TODO</>; }
}