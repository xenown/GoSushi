import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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

  const displayCardData = card => (
    <div style={{ padding: '0 4px' }}>
      {/* will be the actual image later */}
      {card.name}
      {card.data && `Card data: ${card.data}`}
    </div>
  );

  const currPlayer = playersData[0];
  const otherPlayerData = playersData.slice(1);

  return (
    <div className="Board" style={{ display: 'block' }}>
      <h1>Board</h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {otherPlayerData.map(player => (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              margin: '0 6px',
              maxHeight: '250px',
              overflowY: 'auto',
            }}
          >
            <span>{`${player.name}'s played cards:`}</span>
            {player.playedCards.map(card => displayCardData(card))}
          </div>
        ))}
      </div>
      <div>
        {hand.map((card, index) => (
          <button
            key={index}
            style={
              selectedCardIndex === index ? { backgroundColor: 'yellow' } : null
            }
            disabled={played}
            onClick={() => handleSelectCard(index)}
          >
            {displayCardData(card)}
          </button>
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
          {currPlayer &&
            currPlayer.playedCards.map(card => displayCardData(card))}
        </div>
      </div>
      <div>Your points: {playersData[0] && playersData[0].points}</div>
    </div>
  );
};

export default Board;
