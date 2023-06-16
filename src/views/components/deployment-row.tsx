import React from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  Tr,
  Td,
  Button,
  useDisclosure
} from '@chakra-ui/react';
import { Deployment } from '../../models/aws-ecs-deployments.js';

export default function DeploymentRow (props: {
  deployment: Deployment;
  children?: React.ReactNode;
}) {
  const { deployment, children } = props;
  // const [ isTaskDefinitionTableExpanded, setIsTaskDefinitionTableExpanded] = React.useState<boolean>(false);
  const { isOpen, onToggle } = useDisclosure();

  return (
    <React.Fragment>
      <Tr>
        <Td>{deployment.deploymentId}</Td>
        <Td>{deployment.status}</Td>
        <Td>{deployment.startTime?.toLocaleString()}</Td>
        <Td>{deployment.runningCount} / {deployment.pendingCount} / {deployment.desiredCount}</Td>
        <Td>
          <Button
            variant='link'
            onClick={onToggle}
            aria-label={isOpen ? 'upCaret' : 'downCaret'}
            rightIcon={isOpen ? <ChevronUpIcon />: <ChevronDownIcon/>}
            size='sm'
          >
            More Details
          </Button>
        </Td>
      </Tr>
      <Tr hidden={!isOpen}>
        <Td colSpan={5}>
          {children}
        </Td>
      </Tr>
    </React.Fragment>
  );
}