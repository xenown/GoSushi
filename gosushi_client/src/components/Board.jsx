import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const Board = ({ socket }) => {
  const params = useParams();
  console.log(params);
  const [hand, setHand] = useState([]);

  useEffect(() => {
    socket.emit('boardLoaded', params.roomCode);

    const handleDealHand = data => {
      setHand(data);
    };
    socket.on('dealHand', handleDealHand);

    return () => {
      socket.off('dealHand', handleDealHand);
    };
  }, [params.roomCode, socket]);

  return (
    <div className="Board" style={{ display: 'block' }}>
      <h1>Board</h1>
      <p>Display cards somehow</p>
      {hand.map((card, index) => (
        <div key={index}>{card.cardName}</div>
      ))}
    </div>
  );
};

export default Board;
