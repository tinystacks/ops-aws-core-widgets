import { Widget as WidgetType } from '@tinystacks/ops-model';
import { Widget } from '@tinystacks/ops-core';
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { OutputLogEvents } from 'aws-sdk/clients/cloudwatchlogs';

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
  logGroupName: string;
  logStreamName: string;
  startTime: number;
  endTime: number;
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
      logGroupName,
      logStreamName,
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
    this.logGroupName = logGroupName;
    this.logStreamName = logStreamName;
    this.startTime = startTime;
    this.endTime = endTime;
    this._events = [];
  }

  toJson (): WidgetType {
    throw new Error('Method not implemented.');
  }

  async getData (): Promise<void> {
    const cwLogsClient = new CloudWatchLogs({});
    let res = await cwLogsClient.getLogEvents({
      logStreamName: this.logStreamName,
      logGroupName: this.logGroupName,
      startTime: this.startTime,
      endTime: this.endTime
    });
    this._events = [...this.events, ...res.events];
    while (res.nextForwardToken) {
      res = await cwLogsClient.getLogEvents({
        logStreamName: this.logStreamName,
        logGroupName: this.logGroupName,
        startTime: this.startTime,
        endTime: this.endTime,
        nextToken: res.nextForwardToken
      });
      this._events = [...this.events, ...res.events];
    }
  }

  render () {
    throw new Error('Method not implemented.');
  }

  public get events () {
    return this._events;
  }
}