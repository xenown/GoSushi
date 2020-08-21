import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Modal } from 'react-bootstrap';

import { menuCardImageMap } from '../utils/menuSelectionUtils';
import { getCardImage } from '../utils/getCardImage';
import './specialModal.scss';

const SpecialModal = ({ socket }) => {
  const params = useParams();
  const [specialCard, setSpecialCard] = useState(null);
  const [data, setSpecialData] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [alertText, setAlertText] = useState('');

  useEffect(() => {
    const handleSpecialAction = (specialCard, data) => {
      setSpecialCard(specialCard);
      setSpecialData(data);
    };

    const handleWaitingForAction = (playerName, cardName) => {
      setAlertText(`Waiting for ${playerName} to finish ${cardName} actions.`);
    };

    const handleCompleteAction = () => {
      setSpecialCard(null);
      setSpecialData([]);
      setAlertText('');
    };

    socket.on('doSpecialAction', handleSpecialAction);
    socket.on('waitForAction', handleWaitingForAction);
    socket.on('completedSpecialAction', handleCompleteAction);

    return () => {
      socket.off('doSpecialAction', handleSpecialAction);
      socket.off('waitForAction', handleWaitingForAction);
      socket.off('completedSpecialAction', handleCompleteAction);
    };
  }, [params.roomCode, socket]);

  const handleFinish = card => {
    socket.emit('handleSpecialAction', params.roomCode, specialCard, card);
    setSpecialCard(null);
    setSpecialData([]);
    setSelectedIndex(-1);
    setAlertText('');
  };

  const bodyContent = () => {
    if (data.length > 0) {
      return data.map(displayCard);
    } else if (specialCard && data.length === 0) {
      return (
        <Alert variant="info">{'No cards available to choose from'}</Alert>
      );
    }
  };

  const displayCard = (card, index) => {
    let isCard = card.name !== undefined;
    let className = 'card-playable-special';

    if (selectedIndex === index) {
      className += ' card-selected';
    }

    return (
      <div
        className={className}
        key={`cards-for-special-action-${index}`}
        onClick={() => {
          if (specialCard.name === 'Menu' && card.name === 'Menu') {
            setAlertText('You cannot choose a menu card');
          } else {
            setSelectedIndex(index);
            setAlertText('');
          }
        }}
      >
        <img
          className="card-special"
          src={isCard ? getCardImage(card) : menuCardImageMap[card]}
          alt={isCard ? card.name : card}
          key={`card-image-${card}-${index}`}
        />
      </div>
    );
  };

  const modalTitle = !!specialCard
    ? `${specialCard.name} Actions`
    : 'Waiting for others';

  return (
    <Modal
      show={!!specialCard || !!alertText}
      onHide={() => {
        setSelectedIndex(-1);
        setAlertText('');
      }}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>{modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="body-special-modal">{bodyContent()}</div>
        {alertText !== '' && <Alert variant="info">{alertText}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        {!!specialCard && (
          <Button
            variant="primary"
            disabled={data.length > 0 && selectedIndex === -1}
            onClick={() => {
              handleFinish(data[selectedIndex]);
            }}
          >
            Finish
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default SpecialModal;
