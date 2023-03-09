import {
  Tr,
  Td,
  Button,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import React from 'react';
import { Deployment } from '../aws-widgets/aws-ecs-deployments.js';

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
          {/* TODO: Add up and down icon depending on state */}
          <Button onClick={onToggle}>More details</Button>
        </Td>
      </Tr>
      <Tr>
        <Td colSpan={5}>
          <Collapse in={isOpen}>
            {children}
          </Collapse>
        </Td>
      </Tr>
    </React.Fragment>
  );
}