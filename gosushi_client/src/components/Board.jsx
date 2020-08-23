import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import SpecialModal from './SpecialModal';
import ResultsModal from './ResultsModal';
import OtherPlayerGrid from './OtherPlayerGrid';
import Card from './Card';
import './board.scss';


const Board = ({ socket }) => {
  const params = useParams();
  const history = useHistory();
  const [hand, setHand] = useState([]);
  const [playersData, setPlayersData] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(-1);
  const [played, setPlayed] = useState(false);
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

    const handleUnknownGame = () => {
      history.push('/');
    }

    socket.on('sendTurnData', handleDealHand);
    socket.on('unknownGame', handleUnknownGame);

    return () => {
      socket.off('sendTurnData', handleDealHand);
      socket.off('unknownGame', handleUnknownGame);
    };
  }, [params.roomCode, socket, history]);
  
  const handleSelectCard = index => {
    setSelectedCardIndex(index);
  };

  const displayPlayedCard = (card, index) => {
    let canUse =
      (card.name === 'Chopsticks' || card.name === 'Spoon') && hand.length > 1;

    let className = canUse ? 'card-playable' : '';

    if (selectedPlayedCard === index) {
      className += ' card-selected';
    }

    return (
      <Card 
        card={card}
        index={index}
        className={className} 
        isSelected={false}
        played={played}
        handleSelectCard={() => {
          if (canUse) {
            setSelectedPlayedCard(index);
          }
        }}
        scaleUpFactor={4}
        imageClass="card-image-played"
        key={`my-played-cards-${index}`}
      />
    );
  };

  const currPlayer = playersData[0];
  const otherPlayerData = playersData.slice(1);

  return (
    <div className="board">
      <SpecialModal socket={socket} />
      <ResultsModal socket={socket} />
      <div className="action-bar">
        <div className="container-hand">{hand.map((card, index) => 
            <Card card={card} 
              index={index}
              isSelected={selectedCardIndex === index}
              played={played}
              handleSelectCard={handleSelectCard}
              scaleUpFactor={2}
              imageClass="card-image-hand"
              key={`hand_${card.name}_${index}`}
            /> )}
        </div>
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
