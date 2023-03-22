import { cleanTimeRange, combineTimeRangeWithOverrides, getAwsCredentialsProvider, getTimes, TimeUnitEnum } from '../../src/utils/utils.js'; 
import { AwsCredentialsProvider } from '../../src/aws-provider/aws-credentials-provider.js';

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
});