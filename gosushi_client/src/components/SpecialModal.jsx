import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { menuCardImageMap } from '../utils/menuSelectionUtils';
import { getCardImage } from '../utils/getCardImage';

const Board = ({ show, data, specialCard, handleFinishedAction }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [alertText, setAlertText] = useState('');

  const bodyContent = () => {
    if (data.length > 0) {
      return data.map(displayCard);
    } else if (specialCard && data.length === 0) {
      return (
        <div class="alert alert-info" role="alert">
          {'No cards available to choose from'}
        </div>
      );
    }
  };

  const displayCard = (card, index) => {
    let isCard = card.name !== undefined;
    return (
      <div
        key={`cards-for-special-action-${index}`}
        style={{
          margin: '12px',
          backgroundColor: selectedIndex === index ? 'yellow' : 'unset',
        }}
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
          style={{ height: '125px', padding: '0 4px' }}
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
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {bodyContent()}
        </div>
        {alertText !== '' && (
          <div class="alert alert-info" role="alert">
            {alertText}
          </div>
        )}
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

export default Board;
