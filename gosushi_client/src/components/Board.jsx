import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Board = ({ socket }) => {
  const params = useParams();
  const [hand, setHand] = useState([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(-1);
  const [points, setPoints] = useState(0);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    socket.emit('boardLoaded', params.roomCode);

    const handleDealHand = data => {
      setHand(data);
      setSelectedCardIndex(-1);
      setPlayed(false);
    };

    const handleUpdatePoints = data => {
      setPoints(data);
    };

    socket.on('dealHand', handleDealHand);
    socket.on('updatePoints', handleUpdatePoints);

    return () => {
      socket.off('dealHand', handleDealHand);
      socket.off('updatePoints', handleUpdatePoints);
    };
  }, [params.roomCode, socket]);

  const handleSelectCard = index => {
    setSelectedCardIndex(index);
  };

  return (
    <div className="Board" style={{ display: 'block' }}>
      <h1>Board</h1>
      <p>Display cards somehow</p>
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
            <div>
              {/* will be the actual image later */}
              {card.name}
              {card.data && `Card data: ${card.data}`}
            </div>
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
      <div>Your points: {points}</div>
    </div>
  );
};

export default Board;
