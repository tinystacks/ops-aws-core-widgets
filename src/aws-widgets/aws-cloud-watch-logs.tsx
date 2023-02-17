import { Widget as WidgetType } from '@tinystacks/ops-model';
import { Widget } from '@tinystacks/ops-core';
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { OutputLogEvents } from 'aws-sdk/clients/cloudwatchlogs';
import { h, Fragment } from 'preact';

type AwsCloudWatchLogsType = WidgetType & {
  region: string,
  logStreamName: string,
  logGroupName?: string,
  startTime?: number,
  endTime?: number
}

export class AwsCloudWatchLogs extends Widget implements AwsCloudWatchLogsType {
  static type = 'AwsCloudWatchLogs';
  region: string;
  logStreamName: string;
  logGroupName?: string;
  startTime?: number;
  endTime?: number;
  private _events: OutputLogEvents;

  constructor (args: AwsCloudWatchLogsType) {
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
    this._events = [];
  }

  fromJson (object: AwsCloudWatchLogsType): AwsCloudWatchLogs {
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
      endTime: this.endTime
    };
  }

  async getData (): Promise<void> {
    // TODO: integrate provider
    const cwLogsClient = new CloudWatchLogs({});
    let res = await cwLogsClient.getLogEvents({
      logStreamName: this.logStreamName,
      logGroupName: this.logGroupName,
      startTime: this.startTime,
      endTime: this.endTime
    });
    this._events = [...this._events, ...res.events];
    while (res.nextForwardToken) {
      res = await cwLogsClient.getLogEvents({
        logStreamName: this.logStreamName,
        logGroupName: this.logGroupName,
        startTime: this.startTime,
        endTime: this.endTime,
        nextToken: res.nextForwardToken
      });
      this._events = [...this._events, ...res.events];
    }
  }

  get events () {
    return this._events;
  }

  render (): JSX.Element { return <>TODO</>; }
}