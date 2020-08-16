import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { menuCardImageMap } from '../utils/menuSelectionUtils';
import { getCardImage } from '../utils/getCardImage';

const Board = ({ show, data, specialCard, handleFinishedAction }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const bodyContent = () => {
    return data.map(displayCard);
  };

  const displayCard = (card, index) => {
    let isCard = card.name !== undefined;
    return (
      <div
        key={`cards-for-special-action-${index}`}
        style={selectedIndex === index ? { backgroundColor: 'yellow' } : null}
        onClick={() => {
          setSelectedIndex(index);
        }}
      >
        {isCard ? (
          <img
            style={{ height: '125px', padding: '0 4px' }}
            src={getCardImage(card)}
            alt={card.name}
            key={`card-image-${card.name}-${index}`}
          />
        ) : (
          <img
            style={{ height: '125px', padding: '0 4px' }}
            src={menuCardImageMap[card]}
            alt={card}
            key={`card-image-${card}-${index}`}
          />
        )}
      </div>
    );
  };

  return (
    <Modal
      show={show}
      onHide={() => {
        handleFinishedAction(data[selectedIndex]);
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
        <div className="col-6" style={{ display: 'flex' }}>
          {bodyContent()}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {/* <Button variant="secondary" onClick={handleClose}>
          Close
        </Button> */}
        <Button
          variant="primary"
          onClick={() => handleFinishedAction(data[selectedIndex])}
        >
          Finish
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default Board;
