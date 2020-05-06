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
    socket.on('dealHand', data => {
      setHand(data);
    });
  }, []);

  return (
    <div className="Board" style={{ display: 'block' }}>
      <h1>Board</h1>
      <p>Display cards somehow</p>
      {hand.map(card => (
        <p>{card}</p>
      ))}
    </div>
  );
};

export default Board;
