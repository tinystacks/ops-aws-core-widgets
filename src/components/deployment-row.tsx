import {
  Tr,
  Td,
  Box,
  Button
} from '@chakra-ui/react';
import React from 'react';
import { Deployment } from '../aws-widgets/aws-ecs-deployments.js';

export default function DeploymentRow (props: {
  deployment: Deployment;
  children?: React.ReactNode;
}) {
  const { deployment, children } = props;
  const [isTaskDefinitionTableExpanded, setIsTaskDefinitionTableExpanded] =
    React.useState<boolean>(false);

  return (
    <Tr>
      <Td>{deployment.deploymentId}</Td>
      <Td>{deployment.status}</Td>
      <Td>{deployment.startTime?.toLocaleString()}</Td>
      <Td>
        {deployment.runningCount} / {deployment.pendingCount} /{' '}
        {deployment.desiredCount}
      </Td>
      <Td>
        {/* TODO: Add up and down icon depending on state */}
        <Button
          onClick={() =>
            setIsTaskDefinitionTableExpanded(!isTaskDefinitionTableExpanded)
          }
        >
          Expand
        </Button>
      </Td>
      <Box hidden={!isTaskDefinitionTableExpanded}>{children}</Box>,
    </Tr>
  );
}