import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Button, Modal } from 'react-bootstrap';

import { getMenuCardImage } from '../utils/menuSelectionUtils';
import { getCardImage } from '../utils/getCardImage';
import './specialModal.scss';

const SpecialModal = ({ socket }) => {
  const params = useParams();
  const [specialCard, setSpecialCard] = useState(null);
  const [data, setSpecialData] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
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

  const handleFinish = () => {
    let cards = [];
    data.forEach((card, index) => {
      if (selectedIndices.includes(index)) {
        cards.push(card);
      }
    });
    socket.emit('handleSpecialAction', params.roomCode, specialCard, cards);
    setSpecialCard(null);
    setSpecialData([]);
    setSelectedIndices([]);
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

    if (selectedIndices.includes(index)) {
      className += ' card-selected';
    }

    return (
      <div
        className={className}
        key={`cards-for-special-action-${index}`}
        onClick={() => {
          if (specialCard.name === 'Menu' && card.name === 'Menu') {
            setAlertText('You cannot choose a menu card');
          } else if (specialCard.name === 'Takeout Box') {
            setSelectedIndices(
              selectedIndices.includes(index)
                ? selectedIndices.filter(val => val !== index)
                : selectedIndices.concat([index])
            );
          } else {
            setSelectedIndices([index]);
            setAlertText('');
          }
        }}
      >
        <img
          className="card-special"
          src={isCard ? getCardImage(card) : getMenuCardImage(card)}
          alt={isCard ? card.name : card}
          key={`card-image-${card}-${index}`}
        />
      </div>
    );
  };

  const modalTitle = !!specialCard
    ? `${specialCard.name} Actions`
    : 'Waiting for others';

  const disableFinish =
    data.length > 0 &&
    selectedIndices.length === 0 &&
    specialCard.name !== 'Takeout Box';

  return (
    <Modal
      show={!!specialCard || !!alertText}
      onHide={() => {
        setSelectedIndices([]);
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
            disabled={disableFinish}
            onClick={handleFinish}
          >
            Finish
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default SpecialModal;
