import React from 'react';
import {
  Button,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { Views } from '@tinystacks/ops-core';
import isEmpty from 'lodash.isempty';
import TaskDefinitionBody from './components/task-definition-body.js';
import DeploymentRow from './components/deployment-row.js';
import { AwsEcsDeployments as AwsEcsDeploymentsModel, AwsEcsDeploymentsOverrides, AwsEcsDeploymentsType } from '../models/aws-ecs-deployments.js';

import Widget = Views.Widget;

export class AwsEcsDeployments extends AwsEcsDeploymentsModel implements Widget {
  static fromJson (object: AwsEcsDeploymentsType): AwsEcsDeployments {
    return new AwsEcsDeployments(object);
  }

  render (
    _children?: any,
    overridesCallback?: (overrides: AwsEcsDeploymentsOverrides) => void
  ): JSX.Element {
    const deploymentRows = this.deployments.map((deployment) => {
      const taskRows = deployment.taskDefinition.tasks.map((task) => {
        return (
          <Tr>
            <Td>{task.taskId}</Td>
            <Td>{task.startTime?.toLocaleString()}</Td>
            <Td>{task.stopTime?.toLocaleString()}</Td>
            <Td>{task.status}</Td>
            <Td>
              <Button
                variant="outline"
                onClick={() =>
                  overridesCallback({ stoppedTaskId: task.taskId })
                }
                colorScheme="red"
              >
                Kill task
              </Button>
            </Td>
          </Tr>
        );
      });
      const taskTable = isEmpty(deployment.taskDefinition.tasks) ? (
        <Stack/>
      ) : (
        <Stack>
          <TableContainer
            border="1px"
            borderRadius="6px"
            borderColor="gray.100"
          >
            <Table variant="simple">
              <Thead bgColor="gray.50">
                <Tr>
                  <Th>Task Id</Th>
                  <Th>Started</Th>
                  <Th>Stopped</Th>
                  <Th>Status</Th>
                  <Th />
                </Tr>
              </Thead>
              <Tbody>{taskRows}</Tbody>
            </Table>
          </TableContainer>
        </Stack>
      );

      return (
        <DeploymentRow deployment={deployment}>
          <TaskDefinitionBody
            taskDefinition={deployment?.taskDefinition}
            taskTable={taskTable}
          />
        </DeploymentRow>
      );
    });

    return (
      <Stack pt="20px" pb="20px" w="100%">
        <TableContainer border="1px" borderColor="gray.100">
          <Table variant="simple">
            <Thead bgColor="gray.50">
              <Tr>
                <Th>Deployment Id</Th>
                <Th>Deployment Status</Th>
                <Th>Started</Th>
                <Th>Running/Pending/Desired</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>{deploymentRows}</Tbody>
          </Table>
        </TableContainer>
      </Stack>
    );
  }
}