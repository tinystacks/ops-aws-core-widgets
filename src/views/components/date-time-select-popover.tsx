import React from 'react';
import { SettingsIcon } from '@chakra-ui/icons';
import {
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Popover,
  Portal,
  PopoverTrigger
} from '@chakra-ui/react';
import { DateRangePicker } from 'rsuite';
import { DateRange } from 'rsuite/esm/DateRangePicker';

export const PopoverTriggerFixed: React.FC<{ children: React.ReactNode }> =
PopoverTrigger;

interface DateTimeSelectPopoverProps {
  isOpen: boolean;
  onClose: () => any;
  onChange: (customDates: DateRange | null) => any;

}
export function DateTimeSelectPopover (props: DateTimeSelectPopoverProps) {
  const { isOpen, onClose, onChange } = props;
  const { afterToday } = DateRangePicker;
  
  return (
    <Popover isOpen={isOpen} onClose={onClose}>
      <PopoverTriggerFixed>
        <SettingsIcon />
      </PopoverTriggerFixed>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody>
            <DateRangePicker
              placeholder={'Select time range'}
              format='dd/MM/yyyy HH:mm'
              onChange={onChange}
              disabledDate={afterToday && afterToday()}
              placement='autoVerticalEnd'
            />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}