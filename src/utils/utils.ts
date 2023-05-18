import isEmpty from 'lodash.isempty';
import get from 'lodash.get';
import { BaseProvider, TinyStacksError } from '@tinystacks/ops-core';
import dayjs, { ManipulateType } from 'dayjs';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider.js';

export function getAwsCredentialsProvider (providers?: BaseProvider[]): AwsCredentialsProvider {
  if (!providers || isEmpty(providers)) {
    throw TinyStacksError.fromJson({
      message: 'No AwsCredentialsProvider provided',
      status: 400
    });
  }

  const provider = providers[0];
  if (providers[0].type !== AwsCredentialsProvider.type) {
    throw TinyStacksError.fromJson({
      message: `The passed in provider ${provider.id} is not an AwsCredentialsProvider`,
      status: 400
    });
  }

  return provider as AwsCredentialsProvider;
}

// eslint-disable-next-line no-shadow
export enum TimeUnitEnum {
  ns = 'ns',
  ms = 'ms',
  s = 's',
  m = 'm',
  hr = 'h',
  d = 'd',
  w = 'w',
  mo = 'mo',
  yr = 'yr'
}

export type TimeRange = AbsoluteTimeRange | RelativeTime;
export type AbsoluteTimeRange = {
  startTime: number;
  endTime: number;
}

export type RelativeTime = {
  time: number;
  unit: TimeUnitEnum;
}

export function getTimes (timeRange: TimeRange) {
  let startTime: Date;
  let endTime: Date;
  const abosluteTimeRange = timeRange as AbsoluteTimeRange;
  if (abosluteTimeRange.startTime && abosluteTimeRange.endTime) {
    startTime = new Date(abosluteTimeRange.startTime);
    endTime = new Date(abosluteTimeRange.endTime);
  } else {
    const now = dayjs();
    const relativeTimeRange = timeRange as RelativeTime;
    const relativeTimeStart = now.subtract(relativeTimeRange.time, relativeTimeRange.unit as ManipulateType);
    endTime = now.toDate();
    startTime = relativeTimeStart.toDate();
  }
  return {
    startTime,
    endTime
  };
}

export function cleanTimeRange (timeRange: TimeRange, overrides?: TimeRangeOverrides): TimeRange {
  const clean = combineTimeRangeWithOverrides(timeRange, overrides);
  if (!timeRange) {
    throw TinyStacksError.fromJson({
      message: 'No timerange is defined',
      status: 400
    });
  }

  const rTime = get(clean, 'time');
  if (rTime && typeof rTime === 'string') {
    (clean as RelativeTime).time = parseInt(rTime);
  }

  const startTime = get(clean, 'startTime');
  if (startTime && typeof startTime === 'string') {
    (clean as AbsoluteTimeRange).startTime = parseInt(startTime);
  }
  
  const endTime = get(clean, 'endTime');
  if (endTime && typeof endTime === 'string') {
    (clean as AbsoluteTimeRange).endTime = parseInt(endTime);
  }

  return clean;
}

export function combineTimeRangeWithOverrides (timeRange: TimeRange, overrides?: TimeRangeOverrides): TimeRange {
  return overrides && overrides.timeRange ? overrides.timeRange : timeRange;

}

export function getPeriodBasedOnTimeRange (startTime: Date, endTime: Date): number { 
  const duration = Math.abs(endTime.valueOf() - startTime.valueOf());
  if(duration <= (60000 * 30)){ 
    return 60;
  } else if(duration <= (60000 * 60)){ 
    return 300;
  } else if(duration <= (24 * 60000 * 60)){ 
    return 900;
  } else if(duration <= (3 * 24 * 60000 * 60)){ 
    return 1800;
  } else { 
    return Math.floor(duration/15000);
  }
}

export type TimeRangeOverrides = { timeRange?: TimeRange };