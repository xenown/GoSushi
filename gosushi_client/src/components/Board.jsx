import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCardImage } from '../utils/getCardImage';

const Board = ({ socket }) => {
  const params = useParams();
  const [hand, setHand] = useState([]);
  const [playersData, setPlayersData] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(-1);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    socket.emit('boardLoaded', params.roomCode);

    const handleDealHand = (hand, playersData) => {
      setHand(hand);
      setPlayersData(playersData);
      setSelectedCardIndex(-1);
      setPlayed(false);
    };

    socket.on('sendTurnData', handleDealHand);

    return () => {
      socket.off('sendTurnData', handleDealHand);
    };
  }, [params.roomCode, socket]);

  const handleSelectCard = index => {
    setSelectedCardIndex(index);
  };

  const displayPlayedCard = (card, index) => (
    <img
      style={{ height: '125px', padding: '0 4px' }}
      src={getCardImage(card)}
      alt={card.name}
      key={`played_${card.name}_${index}`}
    />
  );

  const currPlayer = playersData[0];
  const otherPlayerData = playersData.slice(1);

  return (
    <div className="Board" style={{ display: 'block' }}>
      <h1>Board</h1>
      <div style={{ display: 'flex' }}>
        {hand.map((card, index) => (
          <div
            key={index}
            style={
              selectedCardIndex === index ? { backgroundColor: 'yellow' } : null
            }
            disabled={played}
            onClick={() => handleSelectCard(index)}
          >
            <img
              style={{ height: '200px', padding: '0 4px' }}
              src={getCardImage(card)}
              alt={card.name}
              key={`hand_${card.name}_${index}`}
            />
          </div>
        ))}
      </div>
      <button
        disabled={selectedCardIndex === -1 || played}
        onClick={() => {
          setPlayed(true);
          socket.emit('cardSelected', params.roomCode, hand[selectedCardIndex]);
        }}
      >
        Play card (you cannot undo this action)
      </button>
      <div>
        <span>{'Your played cards:'}</span>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {currPlayer && currPlayer.playedCards.map(displayPlayedCard)}
        </div>
      </div>
      <div>Your points: {playersData[0] && playersData[0].points}</div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '20px',
        }}
      >
        {otherPlayerData.map(player => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              margin: '6px',
            }}
            key={player.name}
          >
            <span>{`${player.name}'s played cards:`}</span>
            {player.playedCards.map(displayPlayedCard)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
