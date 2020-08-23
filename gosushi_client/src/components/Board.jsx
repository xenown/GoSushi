import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useSpring, animated, config } from 'react-spring';

import { getCardImage } from '../utils/getCardImage';
import SpecialModal from './SpecialModal';
import ResultsModal from './ResultsModal';
import OtherPlayerGrid from './OtherPlayerGrid';
import './board.scss';

const HandCard = ({ card, index, isSelected, played, handleSelectCard }) => {
  const [props, set] = useSpring(() => ({ zIndex: 0, xys: [0, 0, 1], config: config.default }));
  // const [props, set] = useSpring(() => ({ xys: [0, 0, 1], width: 136, height: 208, config: config.default }));

  let className = 'card-playable';

  if (isSelected) {
    className += ' card-selected';
  }
  // selectedCardIndex === index
  const calc = (x, y) => [-(y - window.innerHeight / 2) / 20, (x - window.innerWidth / 2) / 20, 2];
  const trans = (x, y, s) => `scale(${s})`;
  // const trans = (x, y, s) => `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

  return (
    <div
      className={className}
      key={index}
      disabled={played}
      onClick={() => handleSelectCard(index)}
    >
      <animated.div
        class="card"
        onMouseMove={({ clientX: x, clientY: y }) => set({ xys: calc(x, y), zIndex: 1})}
        // onMouseMove={({ clientX: x, clientY: y }) => set({ width : 2 * 136, height: 2 * 208 })}
        onMouseLeave={() => set({ xys: [0, 0, 1], zIndex: 0 })}
        // onMouseLeave={() => set({ xys: [0, 0, 1], width: 136, height: 208 })}
        style={{ zIndex: props.zIndex, transform: props.xys.interpolate(trans)}}
      >
        <img
          className="card-image-hand"
          src={getCardImage(card)}
          alt={card.name}
          key={`hand_${card.name}_${index}`}
          height="100%"
          width="100%"
        />
      </animated.div>
    </div>
  );
};

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

  const currPlayer = playersData[0];
  const otherPlayerData = playersData.slice(1);

  return (
    <div className="board">
      <SpecialModal socket={socket} />
      <ResultsModal socket={socket} />
      <div className="action-bar">
        <div className="container-hand">{hand.map((card, index) => 
            <HandCard card={card} 
              index={index}
              isSelected={selectedCardIndex === index}
              played={played}
              handleSelectCard={handleSelectCard}
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
