import { Widget } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { OutputLogEvents } from 'aws-sdk/clients/cloudwatchlogs';
import { Fragment } from 'preact';
import isEmpty from 'lodash.isempty';

type AwsCloudWatchLogsProps = Widget & {
  region: string,
  logStreamName: string,
  logGroupName?: string,
  startTime?: number,
  endTime?: number
}

export class AwsCloudWatchLogs extends BaseWidget {
  static type = 'AwsCloudWatchLogs';
  region: string;
  logStreamName: string;
  logGroupName?: string;
  startTime?: number;
  endTime?: number;
  private _events: OutputLogEvents;

  constructor (props: AwsCloudWatchLogsProps) {
    super (props);
    this.region = props.region;
    this.logStreamName = props.logStreamName;
    this.logGroupName = props.logGroupName;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this._events = [];
  }

  fromJson (object: AwsCloudWatchLogsProps): AwsCloudWatchLogs {
    return new AwsCloudWatchLogs(object); 
  } 

  toJson (): AwsCloudWatchLogsProps {
    return { 
      ...super.toJson(),  
      region: this.region,
      logStreamName: this.logStreamName,
      logGroupName: this.logGroupName,
      startTime: this.startTime,
      endTime: this.endTime
    };
  }

  async getData (providers?: BaseProvider[]): Promise<void> {
    if (!providers || isEmpty(providers) || providers[0].type !== 'AwsCredentialsProvider') {
      throw new Error('An AwsCredentialsProvider was expected, but was not given');
    }
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