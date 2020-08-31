import React from 'react';
import { Modal } from 'react-bootstrap';

const ConnectionModal = ({ open, message }) => {
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
