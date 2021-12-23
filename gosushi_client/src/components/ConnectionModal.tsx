import React from 'react';
import { Modal } from 'react-bootstrap';

interface IConnectionModalProps {
  open: boolean;
  message: string;
};

const ConnectionModal = ({ open, message }: IConnectionModalProps) => {
  return (
    <Modal
      show={open}
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
