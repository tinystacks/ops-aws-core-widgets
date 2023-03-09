import {
  TableContainer,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Table,
  Button,
  useDisclosure,
  Collapse
} from '@chakra-ui/react';
import React from 'react';
import { TaskDefinition } from '../aws-widgets/aws-ecs-deployments.js';

export default function TaskDefinitionRow (props: {
  taskDefinition: TaskDefinition;
  taskTable: JSX.Element;
}) {
  const { taskDefinition, taskTable } = props;
  const { isOpen, onToggle } = useDisclosure();
  return (
    <React.Fragment>
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
                <Td>{taskDefinition.taskDefinitionArn}</Td>
                <Td>{taskDefinition.cpu}</Td>
                <Td>{taskDefinition.memory}</Td>
                <Td>{taskDefinition.roleArn}</Td>
                <Td>{taskDefinition.execRoleArn}</Td>
                <Td>
                  {/* TODO: Add up and down icon depending on state */}
                  <Button onClick={onToggle}>Show tasks</Button>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Tr>
      <Tr>
        <Collapse in={isOpen}>
          {taskTable}
        </Collapse>
      </Tr>
    </React.Fragment>
  );
}