import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Modal, Container, Form } from 'react-bootstrap';

const RejoinModal = ({ socket, rooms, open, hide }) => {
  const history = useHistory();
  const [roomIndex, setRoomIndex] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleRejoinGame = (roomCode) => {
      if (roomCode) {
        hide();
        history.push(`/game/${roomCode}`);
      } else {
        setMessage("Unable to join room.");
      }
    };

    socket.on('rejoinGameResult', handleRejoinGame);

    return () => {
      socket.off('rejoinGameResult', handleRejoinGame);
    };
  }, [socket, hide, history]);

  const rejoinGame = (roomCode) => {
    socket.emit('rejoinGame', roomCode);
  }

  const bodyContent = () => {
    return (
      <Container fluid>
        <Form.Label>Select an existing game to return to.</Form.Label>
        <Form>
          {rooms.map((roomCode, index) => {
            return (
              <div key={`${index}`} className="mb-3">
                <Form.Check 
                  type={'radio'}
                  id={`${roomCode}`}
                  label={`${roomCode}`}
                  checked={index === roomIndex}
                  onChange={() => { setRoomIndex(index); }}
                />
              </div>
            );
          })}
        </Form>
        <Form.Text className="text-muted">{message}</Form.Text>
      </Container>
    );
  };

  return (
    <Modal
      show={open}
      keyboard={false}
      onHide={() => hide()}
    >
      <Modal.Header>
        <Modal.Title>Existing Games</Modal.Title>
      </Modal.Header>
      <Modal.Body>{bodyContent()}</Modal.Body>
      <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => { rejoinGame(rooms[roomIndex]); }}
          >
            Join Game
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RejoinModal;
