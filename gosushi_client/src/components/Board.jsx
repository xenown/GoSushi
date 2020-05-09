import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Board = ({ socket }) => {
  const params = useParams();
  const [hand, setHand] = useState([]);
  const [selectedCard, setSelectedCard] = useState(-1);

  useEffect(() => {
    socket.emit('boardLoaded', params.roomCode);

    const handleDealHand = data => {
      setHand(data);
      setSelectedCard(-1);
    };
    socket.on('dealHand', handleDealHand);

    return () => {
      socket.off('dealHand', handleDealHand);
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
          {card.cardName}
        </button>
      ))}
    </div>
  );
};

export default Board;
