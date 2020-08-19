import React, { useState } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { menuCardImageMap } from '../utils/menuSelectionUtils';
import { getCardImage } from '../utils/getCardImage';
import './specialModal.scss';

const SpecialModal = ({ show, data, specialCard, handleFinishedAction }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [alertText, setAlertText] = useState('');

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

  return (
    <Modal
      show={show}
      onHide={() => {
        handleFinishedAction(data[selectedIndex]);
        setSelectedIndex(-1);
        setAlertText('');
      }}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header>
        <Modal.Title>{`${
          specialCard && specialCard.name
        } Actions`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="body-special-modal">{bodyContent()}</div>
        {alertText !== '' && <Alert variant="info">{alertText}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          disabled={data.length > 0 && selectedIndex === -1}
          onClick={() => {
            handleFinishedAction(data[selectedIndex]);
            setSelectedIndex(-1);
            setAlertText('');
          }}
        >
          Finish
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SpecialModal;
