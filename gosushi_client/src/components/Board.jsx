import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import { getCardImage } from '../utils/getCardImage';
import SpecialModal from './SpecialModal';
import ResultsModal from './ResultsModal';
import OtherPlayerGrid from './OtherPlayerGrid';
import './board.scss';

const Board = ({ socket }) => {
  const params = useParams();
  const [hand, setHand] = useState([]);
  const [playersData, setPlayersData] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(-1);
  const [played, setPlayed] = useState(false);
  const [specialAction, setSpecialAction] = useState(null);
  const [specialData, setSpecialData] = useState([]);
  const [selectedPlayedCard, setSelectedPlayedCard] = useState(-1);
  const [usePlayedCard, setUsePlayedCard] = useState(false);

  useEffect(() => {
    socket.emit('boardLoaded', params.roomCode);

    const handleDealHand = (hand, playersData) => {
      setHand(hand);
      setPlayersData(playersData);
      setSelectedCardIndex(-1);
      setSelectedPlayedCard(-1);
      setPlayed(false);
      setUsePlayedCard(false);
    };

    const handleSpecialAction = (specialCard, data) => {
      setSpecialAction(specialCard);
      setSpecialData(data);
    };

    const handleCompleteAction = () => {
      setSpecialAction({});
      setSpecialData([]);
    };

    socket.on('sendTurnData', handleDealHand);
    socket.on('doSpecialAction', handleSpecialAction);
    socket.on('completedSpecialAction', handleCompleteAction);

    return () => {
      socket.off('sendTurnData', handleDealHand);
      socket.off('doSpecialAction', handleSpecialAction);
      socket.off('completedSpecialAction', handleCompleteAction);
    };
  }, [params.roomCode, socket]);

  const handleSelectCard = index => {
    setSelectedCardIndex(index);
  };

  const displayHandCard = (card, index) => {
    let className = 'card-playable';

    if (selectedCardIndex === index) {
      className += ' card-selected';
    }

    return (
      <div
        className={className}
        key={index}
        disabled={played}
        onClick={() => handleSelectCard(index)}
      >
        <img
          className="card-image-hand"
          src={getCardImage(card)}
          alt={card.name}
          key={`hand_${card.name}_${index}`}
        />
      </div>
    );
  };

  const displayPlayedCard = (card, index) => {
    let canUse =
      (card.name === 'Chopsticks' || card.name === 'Spoon') && hand.length > 1;

    let className = canUse ? 'card-playable' : '';

    if (selectedPlayedCard === index) {
      className += ' card-selected';
    }

    return (
      <div
        className={className}
        key={`my-played-cards-${index}`}
        disabled={played}
        onClick={() => {
          if (canUse) {
            setSelectedPlayedCard(index);
          }
        }}
      >
        <img
          className="card-image-played"
          src={getCardImage(card)}
          alt={card.name}
          key={`played_${card.name}_${index}`}
        />
      </div>
    );
  };

  const handleFinishedSpeAction = card => {
    socket.emit('handleSpecialAction', params.roomCode, specialAction, card);
    setSpecialAction(null);
    setSpecialData([]);
  };

  const currPlayer = playersData[0];
  const otherPlayerData = playersData.slice(1);

  return (
    <div className="board">
      <SpecialModal
        show={!!specialAction}
        data={specialData}
        specialCard={specialAction}
        handleFinishedAction={handleFinishedSpeAction}
      />
      <ResultsModal socket={socket} />
      <div className="action-bar">
        <div className="container-hand">{hand.map(displayHandCard)}</div>
        <div className="container-buttons">
          <h4>Actions</h4>
          <Button
            className="button"
            disabled={selectedCardIndex === -1 || played}
            onClick={() => {
              setPlayed(true);
              socket.emit(
                'cardSelected',
                params.roomCode,
                hand[selectedCardIndex]
              );
            }}
          >
            {'Play card (you cannot undo this action)'}
          </Button>
          <Button
            className="button"
            disabled={selectedPlayedCard === -1 || usePlayedCard}
            onClick={() => {
              setUsePlayedCard(true);
              socket.emit(
                'usePlayedCard',
                params.roomCode,
                currPlayer.playedCards[selectedPlayedCard]
              );
            }}
          >
            Use special card
          </Button>
        </div>
      </div>

      <div>
        <span>{'Your played cards:'}</span>
        <div className="container-played-cards">
          {currPlayer && currPlayer.playedCards.map(displayPlayedCard)}
        </div>
      </div>
      <div>Your points: {playersData[0] && playersData[0].points}</div>
      <OtherPlayerGrid data={otherPlayerData} />
    </div>
  );
};

export default Board;
