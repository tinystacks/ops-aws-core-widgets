import React from 'react';
import { HStack, Link, Stack, Text, Tooltip, useClipboard } from '@chakra-ui/react';
import { IconButton } from 'rsuite';
import { CopyIcon } from '@chakra-ui/icons';

export default function KeyValueStat (props: { label: string, value: string, href?: string, copy?: string }) {
  const renderedValue = props.href ? (
    <Link color='purple' href={props.href} target='_blank'>
      {props.value}
    </Link>
  ) : props.value;
  const { onCopy, hasCopied } = useClipboard(props.copy || '');
  return (
    <Stack>
      <Text fontSize='12px' lineHeight='16px' casing='uppercase' color='#94A3B8' fontWeight='600'>{props.label}</Text>
      <HStack>
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
        {props.copy && (
          <Tooltip hasArrow label={hasCopied ? 'ARN copied!' : 'Copy ARN'} closeOnClick={false}>
            <IconButton onClick={onCopy} icon={<CopyIcon />} size='xs' />
          </Tooltip>
        )}
      </HStack>
    </Stack>
  );
}