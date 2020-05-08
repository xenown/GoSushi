import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const WaitingRoom = ({ name, roomCode, socket }) => {
  const history = useHistory();
  const [players, setPlayers] = useState([]);

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
  }, [history, socket]);

  return players ? (
    <div>
      <p>Room code: {roomCode}</p>
      <p>Player name: {name}</p>
      {players.map(player => (
        <div key={player}>{`${player} has joined the game`}</div>
      ))}
    </div>
  ) : null;
};

export default WaitingRoom;
