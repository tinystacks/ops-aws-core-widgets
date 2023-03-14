import {
  Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Table, Tbody, Td, Th, Thead, Tr, useDisclosure
} from '@chakra-ui/react';
import React from 'react';
import { Image } from '../utils/aws-ecs-utils.js';

export default function EcsEnvVarsModal (props: { image: Image }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { image } = props;
  const totalRecords = image.envVars.length + image.secrets.length;
  return (
    <span>
      {totalRecords} {totalRecords === 1 ? 'record' : 'records'}&nbsp;
      <Button colorScheme='purple' variant='link' size='sm' onClick={onOpen}>view</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Environment Variables and Secrets</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Table>
              <Thead>
                <Th>Container Port</Th>
                <Th>Host Port</Th>
              </Thead>
              <Tbody>
                {image.envVars.map(ev => (
                  <Tr key={`envVar${ev.name}`}>
                    <Td>{ev.name}</Td>
                    <Td>{ev.value}</Td>
                  </Tr>
                ))}
                {image.secrets.map(secret => (
                  <Tr key={`secret${secret.name}`}>
                    <Td>{secret.name}</Td>
                    <Td>{secret.valueFrom}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </span>
  );
}