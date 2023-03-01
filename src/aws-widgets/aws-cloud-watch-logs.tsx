import React from 'react';
import isEmpty from 'lodash.isempty';

import { Widget } from '@tinystacks/ops-model';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { CloudWatchLogs, OutputLogEvent } from '@aws-sdk/client-cloudwatch-logs';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider.js';
import {
  getAwsCredentialsProvider, getTimes, TimeUnitEnum, TimeRange, cleanTimeRange, TimeRangeOverrides
} from '../utils/utils.js';
import { Box, Code, Stack } from '@chakra-ui/react';
import { TimeRangeSelector } from '../components/time-range-selector.js';
type AwsCloudWatchLogsProps = Widget & {
  region: string,
  logGroupName: string,
  logStreamName?: string,
  timeRange: TimeRange,
  showTimeRangeSelector?: boolean;
  events?: OutputLogEvent[];
}

type AwsCloudWatchLogsOverrides = TimeRangeOverrides;

export class AwsCloudWatchLogs extends BaseWidget {
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
      unit: TimeUnitEnum.m
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

  async getData (providers?: BaseProvider[], overrides?: AwsCloudWatchLogsOverrides): Promise<void> {
    if (!providers || isEmpty(providers) || providers[0].type !== 'AwsCredentialsProvider') {
      throw new Error('An AwsCredentialsProvider was expected, but was not given');
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
      logGroupName: this.logGroupName,
      logStreamNames: [this.logStreamName],
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
  }

  render (_children?: any, overridesCallback?: (overrides: AwsCloudWatchLogsOverrides) => void): JSX.Element {
    const eventsRender = isEmpty(this.events) ?
      <Stack direction='row' style={{ backgroundColor: '#101828' }}>
        <Box style={{ color: '#E1E4E8', padding: '0px 10px' }}>
          There are no logs in this logGroup and logStream during this timeframe
        </Box>
      </Stack> :
      this.events.map(event => (
        <Stack direction='row' style={{ backgroundColor: '#101828' }}>
          <Box style={{
            backgroundColor: '#1D2939',
            color: '#D0D5DD',
            padding: '0px 10px',
            width: '134px'
          }}>
            {new Date(event.timestamp).toLocaleTimeString()}
          </Box>
          <Box style={{ color: '#E1E4E8', padding: '0px 10px' }}>
            {event.message}
          </Box>
        </Stack>
      ));

    return (
      <Stack>
        <Box>
          <TimeRangeSelector
            timeRange={this.timeRange}
            updateTimeRange={timeRange => overridesCallback({ timeRange })}
          />
        </Box>
        <Box className='logscontainer' style={{
          overflow: 'scroll',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '21px',
          letterSpacing: '0em',
          textAlign: 'left',
          padding: '10px',
          borderRadius: '10px',
          maxHeight: '400px'
        }}>

          <Code>
            {eventsRender}
          </Code>
        </Box>
      </Stack>
    );
  }
} 