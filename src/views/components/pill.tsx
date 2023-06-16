import React from 'react';
import {
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Text
} from '@chakra-ui/react';
import { PopoverTriggerFixed } from './date-time-select-popover.js';

type PillProps = {
  text: string;
  tooltip?: string;
};

export function Pill (props: PillProps) {
  const {
    text,
    tooltip
  } = props;
  return (
    <Popover>
      <PopoverTriggerFixed>
        <Button
          size="xs"
          colorScheme='gray'
        >
          {text}
        </Button>
      </PopoverTriggerFixed>
      {tooltip && (
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody>
            <Text fontSize="sm">{tooltip}</Text>
          </PopoverBody>
        </PopoverContent>
      )}
    </Popover>
  );
}