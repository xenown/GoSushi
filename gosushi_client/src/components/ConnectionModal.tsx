import React from 'react';
import { Modal } from 'react-bootstrap';

interface IConnectionModalProps {
  isOpen: boolean;
  message: string;
};

const ConnectionModal = ({ isOpen, message }: IConnectionModalProps) => {
  return (
    <Modal
      show={isOpen}
      keyboard={false}
      backdrop="static"
    >
      <Modal.Header>
        <Modal.Title>Connection Status: {message === "" ? "Waiting for server response..." : message}</Modal.Title>
      </Modal.Header>
    </Modal>
  );
};

export default ConnectionModal;
