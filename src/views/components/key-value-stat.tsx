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
      <Text fontSize='12px' lineHeight='16px' casing='uppercase' color='#94A3B8' fontWeight='600'>{props.label}</Text>
      <Text
        fontSize='14px'
        lineHeight='24px'
        whiteSpace='nowrap'
        overflow='hidden'
        fontWeight='500'
        color='#475569'
        textOverflow='ellipsis'
      >
        {renderedValue}
      </Text>
    </Stack>
  );
}