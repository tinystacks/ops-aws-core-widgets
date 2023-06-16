import React from 'react';
import {
  Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Stack, Table, Tbody, Td, Th, Thead, Tr, useDisclosure
} from '@chakra-ui/react';
import { Image } from '../../utils/aws-ecs-utils.js';

export default function EcsPortsModal (props: { image: Image }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { image } = props;

  return (
    <span>
      {image.portMappings.length} {image.portMappings.length === 1 ? 'record' : 'records'}&nbsp;
      <Button colorScheme='purple' variant='link' size='sm' onClick={onOpen}>view</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ports</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack>
              <Table>
                <Thead>
                  <Th>Container Port</Th>
                  <Th>Host Port</Th>
                </Thead>
                <Tbody>
                  {image.portMappings.map(pm => (
                    <Tr key={`containerport${pm.containerPort || pm.containerPortRange}`}>
                      <Td>{pm.containerPort || pm.containerPortRange}</Td>
                      <Td>{pm.hostPort}</Td>
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