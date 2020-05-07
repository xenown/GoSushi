import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { useParams } from 'react-router-dom';
const ENDPOINT = 'http://127.0.0.1:4001';
const socket = socketIOClient(ENDPOINT);

const Board = () => {
  const params = useParams();
  console.log(params);
  const [hand, setHand] = useState([]);

  useEffect(() => {
    socket.emit('boardLoaded', params.roomCode);

    const handleDealHand = data => {
      data = tempHand;
      setHand(data);
    };
    socket.on('dealHand', handleDealHand);

    return () => {
      socket.off('dealHand', handleDealHand);
    };
  }, [params.roomCode]);

  return (
    <div className="Board" style={{ display: 'block' }}>
      <h1>Board</h1>
      <p>Display cards somehow</p>
      {hand.map(card => (
        <div>
          <p>{card.cardName}</p>
        </div>
      ))}
    </div>
  );
};

const tempHand = [
  {
    cardName: 'Egg Nigiri',
    isFlipped: false,
    data: null,
  },
  {
    cardName: 'Squid Nigiri',
    isFlipped: false,
    data: null,
  },
  {
    cardName: 'Wasabi',
    isFlipped: false,
    data: null,
  },
  {
    cardName: 'Pudding',
    isFlipped: false,
    data: null,
  },
  {
    cardName: 'Chopsticks',
    isFlipped: false,
    data: null,
  },
];

export default Board;
