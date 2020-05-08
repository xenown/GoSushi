import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const WaitingRoom = ({ name, roomCode, socket }) => {
  const history = useHistory();
  const [players, setPlayers] = useState([]);
  const [numPlayers, setNumPlayers] = useState('');

  useEffect(() => {
    const handlePlayerJoined = data => {
      if (Array.isArray(data)) {
        setPlayers(data);
      }
    };

    const handleNumPlayers = data => setNumPlayers(data);

    const handleStartGame = code => {
      history.push(`/game/${code}`);
    };

    socket.on('playerJoined', handlePlayerJoined);
    socket.on('getNumPlayers', handleNumPlayers);
    socket.on('startGame', handleStartGame);

    return () => {
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('getNumPlayers', handleNumPlayers);
      socket.off('startGame', handleStartGame);
    };
  }, [history, socket]);

  return players.length > 0 ? (
    <div>
      <p>Room code: {roomCode}</p>
      <p>Player name: {name}</p>
      {players.map(player => (
        <div key={player}>{`${player} has joined the game`}</div>
      ))}
      <p>
        {players.length}/{numPlayers} players joined
      </p>
    </div>
  ) : null;
};

export default WaitingRoom;
