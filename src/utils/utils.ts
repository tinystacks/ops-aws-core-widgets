import { BaseProvider } from '@tinystacks/ops-core';
import isEmpty from 'lodash.isempty';
import dayjs, { ManipulateType } from 'dayjs';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider.js';

export function getAwsCredentialsProvider (providers?: BaseProvider[]): AwsCredentialsProvider {
  if (!providers || isEmpty(providers)) {
    throw new Error('No AwsCredentialsProvider provided');
  }

  const provider = providers[0];
  if (providers[0].type !== AwsCredentialsProvider.type) {
    throw new Error(`The passed in provider ${provider.id} is not an AwsCredentialsProvider`);
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

export type TimeRange = {
  startTime: number;
  endTime: number;
}

export type RelativeTime = {
  time: number;
  unit: TimeUnitEnum;
}

export function getTimes (timeRange: TimeRange | RelativeTime) {
  let startTime: Date;
  let endTime: Date;
  const abosluteTimeRange = timeRange as TimeRange;
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