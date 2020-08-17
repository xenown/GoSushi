import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Modal, ListGroup, ListGroupItem } from 'react-bootstrap';

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
    console.log(playersData);
    return (
      <ListGroup>
        {playersData.map(player => {
          if (player.points !== score) {
            score = player.points;
            placement += duplicates;
            duplicates = 1;
          } else {
            duplicates++;
          }

          return (
            <ListGroupItem>{`${placement}. ${player.name}, points: ${player.points}`}</ListGroupItem>
          );
        })}
      </ListGroup>
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
      <Modal.Body>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {bodyContent()}
        </div>
      </Modal.Body>
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
