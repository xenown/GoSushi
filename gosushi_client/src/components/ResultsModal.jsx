import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Modal, Container, Row, Col } from 'react-bootstrap';

import './resultsModal.scss';

const ResultsModal = ({ socket }) => {
  const history = useHistory();
  const params = useParams();
  const [playersData, setPlayersData] = useState([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const handleEndGame = (playersData, isHost) => {
      setPlayersData(playersData);
      setIsHost(isHost);
    };

    socket.on('gameResults', handleEndGame);

    return () => {
      socket.off('gameResults', handleEndGame);
    };
  }, [params.roomCode, socket]);

  const bodyContent = () => {
    let placement = 0;
    let score = 0;
    let duplicates = 1;
    return (
      <Container fluid>
        <Row>
          <Col sm={2}>Rank</Col>
          <Col sm={8}>Player Name</Col>
          <Col sm={2}>Points</Col>
        </Row>
        {playersData.map(player => {
          if (player.points !== score) {
            score = player.points;
            placement += duplicates;
            duplicates = 1;
          } else {
            duplicates++;
          }

          let className = '';
          if (placement === 1) {
            className = 'first';
          } else if (placement === 2) {
            className = 'second';
          } else if (placement === 3) {
            className = 'third';
          }

          return (
            <Row className={className}>
              <Col sm={2}>{placement}</Col>
              <Col sm={8}>{player.name}</Col>
              <Col sm={2}>{player.points}</Col>
            </Row>
          );
        })}
      </Container>
    );
  };

  return (
    <Modal
      show={playersData.length > 0}
      onHide={() => {
        isHost ? history.push('/host') : history.push('/join');
      }}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>{`Game Results`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{bodyContent()}</Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => {
            isHost ? history.push('/host') : history.push('/join');
          }}
        >
          End Game
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResultsModal;
