import { Socket } from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Modal, Container, Form } from 'react-bootstrap';

import SocketEventEnum, { IRejoinGameProps, IRejoinGameResultProps } from '../types/socketEvents';

interface IRejoinModalProps {
  socket: Socket;
  rooms: string[];
  isOpen: boolean;
  handleHide: () => void;
};

const RejoinModal = ({ socket, rooms, isOpen, handleHide }: IRejoinModalProps) => {
  const history = useHistory();
  const [roomIndex, setRoomIndex] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleRejoinGame = ({ roomCode }: IRejoinGameResultProps) => {
      if (roomCode) {
        handleHide();
        history.push(`/game/${roomCode}`);
      } else {
        setMessage("Unable to join room.");
      }
    };

    socket.on(SocketEventEnum.REJOIN_GAME_RESULT, handleRejoinGame);

    return () => {
      socket.off(SocketEventEnum.REJOIN_GAME_RESULT, handleRejoinGame);
    };
  }, [socket, handleHide, history]);

  const rejoinGame = (roomCode: string) => {
    socket.emit(SocketEventEnum.REJOIN_GAME, { roomCode } as IRejoinGameProps);
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
      show={isOpen}
      keyboard={false}
      onHide={() => handleHide()}
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
