import { Widget } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { OutputLogEvents } from 'aws-sdk/clients/cloudwatchlogs';
import isEmpty from 'lodash.isempty';
import { getAwsCredentialsProvider } from '../utils';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider';

type AwsCloudWatchLogsProps = Widget & {
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

  constructor (props: AwsCloudWatchLogsProps) {
    super (props);
    this.region = props.region;
    this.logStreamName = props.logStreamName;
    this.logGroupName = props.logGroupName;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.events = [];
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
      endTime: this.endTime,
      events: this.events
    };
  }

  async getData (providers?: BaseProvider[]): Promise<void> {
    if (!providers || isEmpty(providers) || providers[0].type !== 'AwsCredentialsProvider') {
      throw new Error('An AwsCredentialsProvider was expected, but was not given');
    }
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