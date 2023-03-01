import React from 'react';
import { Radio, RadioGroup, Stack } from '@chakra-ui/react';
import { DateRangePicker } from 'rsuite';
import { DateRange } from 'rsuite/esm/DateRangePicker';
import { getTimes, RelativeTime, TimeRange, TimeUnitEnum } from '../utils/utils.js';

const timeRangesToRadioValue: { [key: string]: RelativeTime } = {
  '5m': { time: 5, unit: TimeUnitEnum.m },
  '30m': { time: 30, unit: TimeUnitEnum.m },
  '1hr': { time: 1, unit: TimeUnitEnum.hr },
  '12hr': { time: 12, unit: TimeUnitEnum.hr },
  '3d': { time: 3, unit: TimeUnitEnum.d },
  '1w': { time: 1, unit: TimeUnitEnum.w }
};

export type TimeRangeSelectorProps = {
  timeRange?: TimeRange;
  updateTimeRange: (timeRange: TimeRange) => void;
}

const CUSTOM = 'custom';
export function TimeRangeSelector (props: TimeRangeSelectorProps) {
  const { timeRange, updateTimeRange } = props;

  function onRadioChange (value: string) {
    if (value !== CUSTOM) {
      updateTimeRange(timeRangesToRadioValue[value]);
    }
  }

  let timeRangeRadioValue = CUSTOM;
  if (!timeRange) {
    updateTimeRange(timeRangesToRadioValue['1hr']);
  }

  if ((timeRange as RelativeTime).time) {
    const timeRangeSearch = Object.entries(timeRangesToRadioValue).find(([_key, { time, unit }]) => {
      const relativeTimeRange = timeRange as RelativeTime;
      return time === relativeTimeRange.time && unit === relativeTimeRange.unit;
    });
    if (timeRangeSearch) {
      timeRangeRadioValue = timeRangeSearch[0];
    }
  }
  const { afterToday } = DateRangePicker;
  function onDateRangeChange (customDates: DateRange | null) {
    if (customDates !== null) {
      updateTimeRange({
        startTime: customDates[0].getTime(),
        endTime: customDates[1].getTime()
      });
    }
  }
  return (
    <Stack spacing="5">
      <RadioGroup
        size="sm"
        name="time-range"
        value={timeRangeRadioValue}
        onChange={onRadioChange}
      >
        {Object.keys(timeRangesToRadioValue).map(k => (
          <Radio value={k} key={`timeRange${k}`}>{k}</Radio>
        ))}
        <Radio value={CUSTOM}>
          <DateRangePicker
            placeholder='Select time range'
            format="MM/dd/yyyy HH:mm:ss"
            onChange={onDateRangeChange}
            disabledDate={afterToday && afterToday()}
            placement="autoVerticalEnd"
            value={[getTimes(timeRange).startTime, getTimes(timeRange).endTime]}
          />
        </Radio>
      </RadioGroup>
    </Stack>
  );
}