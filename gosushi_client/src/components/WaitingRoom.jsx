import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import DisplayMenu from './DisplayMenu';
import './common.scss';
import './menuSelection.scss';
import './waitingRoom.scss';

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
    <div className="mb-3">
      {players.length > 0 && roomCode !== "" ? (
        <div className="center vertical menu-wrapper mb-3">
          <p>Room code: {roomCode}</p>
          <p>Your name: {name}</p>
          <div className="list-wrapper">
            {players.map(player => (
              <div key={player}>{`${player} has joined the game`}</div>
            ))}
            <div>
              {players.length}/{numPlayers} players joined
            </div>
          </div>
        </div>
      ) : null}
      <DisplayMenu menu={menu} />
    </div>
  );
};

export default WaitingRoom;
