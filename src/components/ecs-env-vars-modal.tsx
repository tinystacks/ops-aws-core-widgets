import {
  Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Table, Tbody, Td, Th, Thead, Tr, useDisclosure
} from '@chakra-ui/react';
import React from 'react';
import { Image } from '../ops-types.js';

export default function EcsEnvVarsModal (props: { image: Image }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { image } = props;
  const totalRecords = (image.envVars?.length || 0) + (image.secrets?.length || 0);
  return (
    <span>
      {totalRecords} {totalRecords === 1 ? 'record' : 'records'}&nbsp;
      <Button colorScheme='purple' variant='link' size='sm' onClick={onOpen}>view</Button>
      <Modal isOpen={isOpen} onClose={onClose} size='4xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Environment Variables and Secrets</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <Table>
                <Thead>
                  <Th>Container Port</Th>
                  <Th>Host Port</Th>
                </Thead>
                <Tbody>
                  {(image.envVars || []).map(ev => (
                    <Tr key={`envVar${ev.name}`}>
                      <Td>{ev.name}</Td>
                      <Td>{ev.value}</Td>
                    </Tr>
                  ))}
                  {(image.secrets || []).map(secret => (
                    <Tr key={`secret${secret.name}`}>
                      <Td>{secret.name}</Td>
                      <Td>{secret.valueFrom}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Stack>
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