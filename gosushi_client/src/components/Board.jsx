import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Board = ({ socket }) => {
  const params = useParams();
  const [hand, setHand] = useState([]);
  const [selectedCard, setSelectedCard] = useState(-1);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    socket.emit('boardLoaded', params.roomCode);

    const handleDealHand = data => {
      setHand(data);
      setSelectedCard(-1);
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

  const handleSelectCard = (card, index) => {
    socket.emit('cardSelected', params.roomCode, card);
    setSelectedCard(index);
  };

  return (
    <div className="Board" style={{ display: 'block' }}>
      <h1>Board</h1>
      <p>Display cards somehow</p>
      {hand.map((card, index) => (
        <button
          key={index}
          style={selectedCard === index ? { backgroundColor: 'yellow' } : null}
          disabled={selectedCard > 0}
          onClick={() => handleSelectCard(card, index)}
        >
          {card.name}
        </button>
      ))}
      <div>Your points: {points}</div>
    </div>
  );
};

export default Board;
