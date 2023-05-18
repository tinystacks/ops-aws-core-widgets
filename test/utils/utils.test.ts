import { cleanTimeRange, combineTimeRangeWithOverrides, getAwsCredentialsProvider, getPeriodBasedOnTimeRange, getTimes, TimeUnitEnum } from '../../src/utils/utils.js'; 
import { AwsCredentialsProvider } from '../../src/aws-provider/aws-credentials-provider.js';
import dayjs from 'dayjs';

describe('utils', () => {
  describe('getAwsCredentialsProvider', () => {
    it('throws when null or empty', () => {
      const expectedError = 'No AwsCredentialsProvider provided';
      expect(() => getAwsCredentialsProvider()).toThrowError(expectedError);
      expect(() => getAwsCredentialsProvider([])).toThrowError(expectedError);
    });

    it ('throws when an awscredentialsprovider is not provided', () => {
      const provider = {
        id: 'mock-provider',
        type: 'MockProvider'
      };
      const expectedError = `The passed in provider ${provider.id} is not an AwsCredentialsProvider`
      // @ts-ignore
      expect(() => getAwsCredentialsProvider([provider])).toThrowError(expectedError);
    });

    it ('returns when an awscredentialsprovider is provided first', () => {
      const provider = {
        id: 'mock-provider',
        type: AwsCredentialsProvider.type
      };
      // @ts-ignore
      expect(getAwsCredentialsProvider([provider])).toStrictEqual(provider);
    });
  });

  describe('getTimes', () => {
    it ('absoluteTimeRange', () => {
      const timeRange = {
        startTime: new Date().getTime() - 1000,
        endTime: new Date().getTime()
      };
      expect(getTimes(timeRange)).toStrictEqual({
        startTime: new Date(timeRange.startTime),
        endTime: new Date(timeRange.endTime)
      });
    });
    it ('relativeTimeRange', () => {
      const timeRange = {
        time: 1, 
        unit: TimeUnitEnum.hr
      };
      const now = dayjs();
      expect(getTimes(timeRange)).toStrictEqual({
        startTime: now.subtract(1, 'hour').toDate(),
        endTime: now.toDate()
      });
    });
  });


  describe('cleanTimeRange', () => {
    it ('throws when timerange is not defined', () => {
      // @ts-ignore 
      expect(() => cleanTimeRange(undefined)).toThrowError('No timerange is defined');
    });

    it ('combines timeRange and overrides correctly', () => {
      const timeRange = {
        startTime: new Date().getTime() - 1000,
        endTime: new Date().getTime()
      };

      const overrideTimeRange = {
        startTime: new Date().getTime() - 10000,
        endTime: new Date().getTime()
      };
      expect(combineTimeRangeWithOverrides(timeRange)).toBe(timeRange);
      expect(combineTimeRangeWithOverrides(timeRange, {})).toBe(timeRange);
      expect(combineTimeRangeWithOverrides(timeRange, {timeRange: overrideTimeRange})).toBe(overrideTimeRange);
    });

    it ('relativeTime', () => {
      const timeRange = {
        time: 100,
        unit: TimeUnitEnum.s
      };

      expect(cleanTimeRange(timeRange)).toBe(timeRange);
      // @ts-ignore
      expect(cleanTimeRange({ ...timeRange, time: timeRange.time.toString()})).toStrictEqual(timeRange);
    });

    it ('absoluteTime', () => {
      const timeRange = {
        startTime: new Date().getTime() - 1000,
        endTime: new Date().getTime()
      };

      expect(cleanTimeRange(timeRange)).toBe(timeRange);
      expect(cleanTimeRange({
        ...timeRange,
        // @ts-ignore
        startTime: timeRange.startTime.toString()
      })).toStrictEqual(timeRange);
      expect(cleanTimeRange({
        ...timeRange,
        // @ts-ignore
        startTime: timeRange.startTime.toString(),
        // @ts-ignore
        endTime: timeRange.endTime.toString()
      })).toStrictEqual(timeRange);

      expect(cleanTimeRange({
        ...timeRange,
        // @ts-ignore
        endTime: timeRange.endTime.toString()
      })).toStrictEqual(timeRange);
    });
  });

  describe('getPeriodBasedOnTimeRange', () => {
    it('returns 60 when duration is less than or equal to 30 minutes', () => {
      const startTime = new Date('2023-05-01T12:00:00Z');
      const endTime = new Date('2023-05-01T12:29:59Z');
      const period = getPeriodBasedOnTimeRange(startTime, endTime);
      expect(period).toBe(60);
    });
  
    it('returns 300 when duration is less than or equal to 1 hour', () => {
      const startTime = new Date('2023-05-01T12:00:00Z');
      const endTime = new Date('2023-05-01T12:59:59Z');
      const period = getPeriodBasedOnTimeRange(startTime, endTime);
      expect(period).toBe(300);
    });
  
    it('returns 900 when duration is less than or equal to 24 hours', () => {
      const startTime = new Date('2023-05-01T12:00:00Z');
      const endTime = new Date('2023-05-02T11:59:59Z');
      const period = getPeriodBasedOnTimeRange(startTime, endTime);
      expect(period).toBe(900);
    });
  
    it('returns 1800 when duration is less than or equal to 3 days', () => {
      const startTime = new Date('2023-05-01T12:00:00Z');
      const endTime = new Date('2023-05-04T11:59:59Z');
      const period = getPeriodBasedOnTimeRange(startTime, endTime);
      expect(period).toBe(1800);
    });
  });
  
});