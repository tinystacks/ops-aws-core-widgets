import React from 'react';
import { Link, Stack, Text } from '@chakra-ui/react';

export default function KeyValueStat (props: { label: string, value: string, href?: string}) {
  const renderedValue = props.href ? (
    <Link color='purple' href={props.href} target='_blank'>
      {props.value}
    </Link>
  ) : props.value;
  return (
    <Stack>
      <Text fontSize='sm'>{props.label}</Text>
      <Text
        fontSize='md'
        whiteSpace='nowrap'
        overflow='hidden'
        textOverflow='ellipsis'
      >
        {renderedValue}
      </Text>
    </Stack>
  );
}