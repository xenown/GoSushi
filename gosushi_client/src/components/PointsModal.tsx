import { isEmpty } from 'lodash';
import { Socket } from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Modal, Container, Row, Col } from 'react-bootstrap';
import { IPlayerResult } from '../types/IPlayer';
import IRouteParams from '../types/IRouteParams';
import SocketEventEnum, { ISendPlayerResultProps, IStartRoundProps } from '../types/socketEvents';

import './resultsModal.scss';

interface IPointsModalProps {
  socket: Socket;
  isHost: boolean;
};

const PointsModal = ({ socket, isHost }: IPointsModalProps) => {
  const params: IRouteParams = useParams();
  const [points, setPoints] = useState<IPlayerResult>({});

  useEffect(() => {
    const handlePlayerResult = ({ result }: ISendPlayerResultProps) => {
      setPoints(result);
    };

    const closeModal = () => {
      setPoints({});
    };
  
    socket.on(SocketEventEnum.SEND_PLAYER_RESULT, handlePlayerResult);
    socket.on(SocketEventEnum.UPDATE_ROUND_NUMBER, closeModal);
    socket.on(SocketEventEnum.GAME_RESULTS, closeModal);
    return () => {
      socket.off(SocketEventEnum.SEND_PLAYER_RESULT, handlePlayerResult);
      socket.off(SocketEventEnum.UPDATE_ROUND_NUMBER, closeModal);
      socket.off(SocketEventEnum.GAME_RESULTS, closeModal);
    };
  }, [params.roomCode, socket]);

  const onClose = () => {
    socket.emit(SocketEventEnum.START_ROUND, { roomCode: params.roomCode } as IStartRoundProps);
    setPoints({});
  };

  const bodyContent = () => {
    return (
      <Container fluid>
        <Row>
          <Col sm={8}>Card Name</Col>
          <Col sm={4}>Points</Col>
        </Row>
        {Object.entries(points).map(([card, score], index) => {
          return (
            <Row key={index}>
              <Col sm={8}>{card}</Col>
              <Col sm={4}>{score}</Col>
            </Row>
          );
        })}
      </Container>
    );
  };

  return (
    <Modal
      show={!isEmpty(points)}
      onHide={onClose}
      backdrop="static"
      keyboard={false}
      size="lg"
    >
      <Modal.Header>
        <Modal.Title>{`Round Results`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{bodyContent()}</Modal.Body>
      <Modal.Footer>
        {isHost ? <Button variant="primary" onClick={onClose}>
          Next Round
        </Button> : 'Waiting for Host'}
      </Modal.Footer>
    </Modal>
  );
};

export default PointsModal;
