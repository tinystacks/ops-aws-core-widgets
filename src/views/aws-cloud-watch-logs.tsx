import React from 'react';
import isEmpty from 'lodash.isempty';
import { Views } from '@tinystacks/ops-core';
import { Box, Code, Stack } from '@chakra-ui/react';
import { TimeRangeOverrides } from '../utils/utils.js';
import { TimeRangeSelector } from './components/time-range-selector.js';
import {
  AwsCloudWatchLogs as AwsCloudWatchLogsProps
} from '../ops-types.js';
import { AwsCloudWatchLogs as AwsCloudWatchLogsModel } from '../models/aws-cloud-watch-logs.js';

import Widget = Views.Widget;

type AwsCloudWatchLogsOverrides = TimeRangeOverrides;

export class AwsCloudWatchLogs extends AwsCloudWatchLogsModel implements Widget {
  static fromJson (object: AwsCloudWatchLogsProps): AwsCloudWatchLogs {
    return new AwsCloudWatchLogs(object);
  }

  render (_children?: any, overridesCallback?: (overrides: AwsCloudWatchLogsOverrides) => void): JSX.Element {
    const eventsRender = isEmpty(this.events) ?
      <Stack direction='row' bgColor='#101828'>
        <Box style={{ color: '#E1E4E8', padding: '0px 10px' }}>
          There are no logs in this logGroup and logStream during this timeframe
        </Box>
      </Stack> :
      this.events.map(event => (
        <Stack direction='row' bgColor='#101828'>
          <Box bgColor='#1D2939' color='#D0D5DD' p='0px 10px' width='134px'>
            {new Date(event.timestamp).toLocaleTimeString()}
          </Box>
          <Box color='#E1E4E8' p='0px 10px'>
            {event.message}
          </Box>
        </Stack>
      ));

    return (
      <Stack w='100%' p='20px'>
        <Box>
          <TimeRangeSelector
            timeRange={this.timeRange}
            updateTimeRange={timeRange => overridesCallback({ timeRange })}
          />
        </Box>
        <Box w='100%' style={{
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

          <Code w='100%'>
            {eventsRender}
          </Code>
        </Box>
      </Stack>
    );
  }
} 