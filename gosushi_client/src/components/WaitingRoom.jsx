import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { useHistory } from 'react-router-dom';
const ENDPOINT = 'http://127.0.0.1:4001';
const socket = socketIOClient(ENDPOINT);

const WaitingRoom = ({ name, roomCode }) => {
  const history = useHistory();
  const [players, setPlayers] = useState('');

  useEffect(() => {
    const handleNewPlayer = data => {
      if (Array.isArray(data)) {
        setPlayers(data);
      }
    };

    const handleStartGame = code => {
      history.push(`/game/${code}`);
    };

    socket.on('newPlayer', handleNewPlayer);
    socket.on('startGame', handleStartGame);

    return () => {
      socket.off('newPlayer', handleNewPlayer);
      socket.off('startGame', handleStartGame);
    };
  }, [history]);

  return (
    <div>
      <p>Room code: {roomCode}</p>
      <p>Player name: {name}</p>
      {players &&
        players.map(player => (
          <div key={player}>{`${player} has joined the game`}</div>
        ))}
    </div>
  );
};

export default WaitingRoom;
