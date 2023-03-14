import React from 'react';
import { Link } from '@chakra-ui/layout';
import { Stat, StatHelpText, StatLabel } from '@chakra-ui/stat';

export default function KeyValueStat (props: { label: string, value: string, href?: string}) {
  const renderedValue = props.href ? (
    <Link color='purple' href={props.href} target='_blank'>
      {props.value}
    </Link>
  ) : props.value;
  return (
    <Stat>
      <StatHelpText>{props.label}</StatHelpText>
      <StatLabel>
        {renderedValue}
      </StatLabel>
    </Stat>
  );
}