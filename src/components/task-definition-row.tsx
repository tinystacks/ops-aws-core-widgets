import {
  TableContainer,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Table,
  Button,
  Box
} from '@chakra-ui/react';
import React from 'react';
import { Deployment } from '../aws-widgets/aws-ecs-deployments.js';

export default function TaskDefinitionRow (props: {
  deployment: Deployment;
  taskTable: JSX.Element;
}) {
  const { deployment, taskTable } = props;
  const [isTaskTableExpanded, setIsTaskTableExpanded] =
    React.useState<boolean>(false);
  return (
    <Tr>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>TASK DEFINITION</Th>
              <Th>CPU LIMITS</Th>
              <Th>MEMORY LIMITS</Th>
              <Th>ROLE ARN</Th>
              <Th>EXECUTION ROLE ARN</Th>
              <Th>Expand</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{deployment.taskDefinition.taskDefinitionArn}</Td>
              <Td>{deployment.taskDefinition.cpu}</Td>
              <Td>{deployment.taskDefinition.memory}</Td>
              <Td>{deployment.taskDefinition.roleArn}</Td>
              <Td>{deployment.taskDefinition.execRoleArn}</Td>
              <Td>
                {/* TODO: Add up and down icon depending on state */}
                <Button
                  onClick={() => setIsTaskTableExpanded(!isTaskTableExpanded)}
                >
                  Expand
                </Button>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
      <Box hidden={!isTaskTableExpanded}>{taskTable}</Box>
    </Tr>
  );
}