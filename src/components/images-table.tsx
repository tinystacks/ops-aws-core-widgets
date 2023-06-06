import { TableContainer, Table, Thead, Tr, Th, Tbody, Td } from '@chakra-ui/react';
import _ from 'lodash';
import React from 'react';
import { Image } from '../ops-types.js';

export default function ImagesTable (props: {
  images: Image[]
}) {
  const { images } = props;
  const imageRows = images?.map((image) => {
    const portMappings = (image?.portMappings?.map(portMapping =>
      `${portMapping.hostPort}:${portMapping.containerPort}`
    ));
    const portMappingsString = portMappings ? portMappings.join('\n') : undefined;
    const envVars = (image?.envVars?.map(envVar =>
      `${envVar.name}: ${envVar.value}`
    ));
    const envVarsString = envVars ? envVars.join('\n') : undefined;
    const secrets = (image?.secrets?.map(secret =>
      `${secret.name}: ${secret.valueFrom}`
    ));
    const secretsString = secrets ? secrets.join('\n') : undefined;
    return (
      <Tr>
        <Td>{image?.containerId}</Td>
        <Td>{portMappingsString}</Td>
        <Td>{envVarsString}</Td>
        <Td>{secretsString}</Td>
        <Td>{_.get(image, 'volumes[0].name')}</Td>
      </Tr>
    );
  });

  return (
    <React.Fragment>
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>CONTAINER ID</Th>
              <Th>PORT MAPPINGS</Th>
              <Th>ENV VARIABLES</Th>
              <Th>SECRETS</Th>
              <Th>VOLUME</Th>
              <Th>View logs</Th>
            </Tr>
          </Thead>
          <Tbody>
            {imageRows}
          </Tbody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
}