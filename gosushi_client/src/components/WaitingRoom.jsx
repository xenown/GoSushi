import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import DisplayMenu from './DisplayMenu';

const WaitingRoom = ({ name, roomCode, socket }) => {
  const history = useHistory();
  const [players, setPlayers] = useState([]);
  const [menu, setMenu] = useState({});
  const [numPlayers, setNumPlayers] = useState('');

  useEffect(() => {
    const handlePlayerJoined = (dataPlayers, dataMenu) => {
      if (Array.isArray(dataPlayers)) {
        setPlayers(dataPlayers);
      }
      setMenu(dataMenu);
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

  return (
    <div>
      {players.length > 0 ? (
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
      ) : null}
      <DisplayMenu menu={menu} />
    </div>
  );
};

export default WaitingRoom;
