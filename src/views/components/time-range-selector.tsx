import React from 'react';
import { useState } from 'react';
import { Stack } from '@chakra-ui/react';
import { DateRange } from 'rsuite/esm/DateRangePicker';
import { RelativeTime, TimeRange, TimeUnit } from '../../ops-types.js';
import { RadioButtonGroup, RadioButton } from './radio-button-group.js';
import { DateTimeSelectPopover } from './date-time-select-popover.js';

const timeRangesToRadioValue: { [key: string]: RelativeTime } = {
  '5m': { time: 5, unit: TimeUnit.m },
  '30m': { time: 30, unit: TimeUnit.m },
  '1hr': { time: 1, unit: TimeUnit.hr },
  '12hr': { time: 12, unit: TimeUnit.hr },
  '3d': { time: 3, unit: TimeUnit.d },
  '1w': { time: 1, unit: TimeUnit.w }
};

export type TimeRangeSelectorProps = {
  timeRange?: TimeRange;
  updateTimeRange: (timeRange: TimeRange) => void;
}


const CUSTOM = 'custom';
export function TimeRangeSelector (props: TimeRangeSelectorProps) {
  const { timeRange, updateTimeRange } = props;
  const [isTimePopoverOpen, setIsTimePopoverOpen] = useState(false);

  function onChange (value: string) {
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
  function onDateRangeChange (customDates: DateRange | null) {
    if (customDates !== null) {
      updateTimeRange({
        startTime: customDates[0].getTime(),
        endTime: customDates[1].getTime()
      });
    }
  }
  return (
    <Stack spacing='5'>
      <RadioButtonGroup
        size='sm'
        name='time-range'
        value={timeRangeRadioValue}
        onChange={onChange}
      >
        {Object.keys(timeRangesToRadioValue).map(k => (
          <RadioButton value={k}>{k}</RadioButton>
        ))}
        <RadioButton value={CUSTOM} onClick={() => setIsTimePopoverOpen(true)}>
          <DateTimeSelectPopover 
            isOpen={isTimePopoverOpen} 
            onClose={() => setIsTimePopoverOpen(false)} 
            onChange={onDateRangeChange}/>
        </RadioButton>
      </RadioButtonGroup>
    </Stack>
  );
}