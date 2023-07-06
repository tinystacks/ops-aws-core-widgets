import React from 'react';
import { CheckIcon, QuestionIcon, WarningIcon } from '@chakra-ui/icons';
import { Circle, Icon, Spinner, Tooltip } from '@chakra-ui/react';
import { StageExecutionStatus } from '@aws-sdk/client-codepipeline';

interface StatusIconProps {
  awaitingApproval?: boolean;
  status?: StageExecutionStatus | string;
  w?: string;
  h?: string;
  size?: string;
}

function getStatusColor (status: StageExecutionStatus) {
  switch (status) {
    case StageExecutionStatus.Failed:
      return 'red';
    case StageExecutionStatus.Succeeded:
      return 'green';
    default:
      return 'gray';
  }
}

export function StatusIcon (props: StatusIconProps) {
  const {
    status = 'No Status',
    awaitingApproval,
    w,
    h,
    size
  } = props;
  let DisplayIcon: typeof Icon | typeof Spinner = Icon;
  switch (status) {
    case StageExecutionStatus.Failed:
      DisplayIcon = WarningIcon;
      break;
    case StageExecutionStatus.Succeeded:
      DisplayIcon = CheckIcon;
      break;
    case StageExecutionStatus.InProgress:
      DisplayIcon = Spinner;
      break;
    default:
      DisplayIcon = QuestionIcon;
  }

  if (awaitingApproval) {
    DisplayIcon = WarningIcon;
  }

  const bgColor = awaitingApproval
    ? 'orange'
    : getStatusColor(status as StageExecutionStatus);

  const tooltipLabel = awaitingApproval ? 'Awaiting approval' : status;
  return (
    <Tooltip label={tooltipLabel}>
      <Circle
        size={size || '23px'}
        bg={bgColor}
        color='white'
        className={`${status}-icon`}
      >
        <DisplayIcon w={w || '3'} h={h || '3'} />
      </Circle>
    </Tooltip>
  );
}