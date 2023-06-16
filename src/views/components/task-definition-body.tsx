import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import {
  TableContainer,
  Text,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Table,
  Button,
  useDisclosure,
  Link,
  Stack
} from '@chakra-ui/react';
import React from 'react';
import { ecsTaskDefinitionArnToUrl, roleArnToUrl } from '../../utils/arn-utils.js';
import { TaskDefinition } from '../../models/aws-ecs-deployments.js';

export default function TaskDefinitionBody (props: {
  taskDefinition: TaskDefinition;
  taskTable: JSX.Element;
}) {
  const { taskDefinition, taskTable } = props;
  const { isOpen, onToggle } = useDisclosure();
  return (
    <Stack>
      <Text fontSize='md'>
        Task Definition
      </Text>
      <TableContainer border='1px' borderRadius='6px' borderColor='gray.100'>
        <Table variant="simple">
          <Thead bgColor='gray.50'>
            <Tr>
              <Th>Task Definition</Th>
              <Th>Cpu Limits</Th>
              <Th>Memory limits</Th>
              <Th>Role Arn</Th>
              <Th>Execution Role Arn</Th>
              <Th/>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <TableCellLink href={ecsTaskDefinitionArnToUrl(taskDefinition.taskDefinitionArn)} label={taskDefinition.taskDefinitionArn} />
              </Td>
              <Td>{taskDefinition.cpu}</Td>
              <Td>{taskDefinition.memory}</Td>
              <Td>
                <TableCellLink href={roleArnToUrl(taskDefinition.roleArn)} label={taskDefinition.roleArn} />
              </Td>
              <Td>
                <TableCellLink href={roleArnToUrl(taskDefinition.execRoleArn)} label={taskDefinition.execRoleArn} />
              </Td>
              <Td>
                {/* TODO: Add up and down icon depending on state */}
                <Button
                  variant='link'
                  onClick={onToggle}
                  aria-label={isOpen ? 'upCaret' : 'downCaret'}
                  rightIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  size='sm'
                  color='purple'
                >
                  View Tasks
                </Button>
              </Td>
            </Tr>
            <Tr hidden={!isOpen}>
              <Td colSpan={6}>
                {taskTable}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

function TableCellLink (props: { href: string, label: string }) {
  return (
    <Link
      href={props.href}
      target='_blank'
      color='purple'
      maxW='200px'
      display='block'
      overflow='hidden'
      textOverflow='ellipsis'
    >
      {props.label}
    </Link>
  );
}