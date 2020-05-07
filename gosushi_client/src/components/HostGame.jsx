import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { useHistory } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
import MenuSelection from './MenuSelection';
const ENDPOINT = 'http://127.0.0.1:4001';
const socket = socketIOClient(ENDPOINT);

const HostGame = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [numPlayers, setNumPlayers] = useState('');
  const [isCreating, setIsCreating] = useState(true);
  const [message, setMessage] = useState('');
  const [menu, setMenu] = useState({});

  useEffect(() => {
    const handleNewPlayer = data => {
      if (!Array.isArray(data)) {
        setMessage(data);
      } else {
        setIsCreating(false);
      }
    };

    socket.on('newPlayer', handleNewPlayer);

    return () => {
      socket.off('newPlayer', handleNewPlayer);
    };
  }, []);

  const handleSubmit = () => {
    socket.emit('hostGame', menu, numPlayers, roomCode, name);
    setMessage('Loading...');
  };

  const handleBack = () => {
    history.push('/');
  };

  const handleMenu = menu => {
    setMenu(menu);
  };

  const createForm = (
    <div>
      <MenuSelection handleMenu={handleMenu} />
      <div>
        Enter your name
        <input type="text" onChange={e => setName(e.target.value)} />
      </div>
      <div>
        Enter number of players (2-8):
        <input
          type="number"
          min="2"
          max="8"
          onChange={e => {
            setNumPlayers(parseInt(e.target.value, 10));
          }}
        />
      </div>
      <div>
        Enter your room code
        <input type="text" onChange={e => setRoomCode(e.target.value)} />
      </div>
      <button onClick={handleBack}>Back</button>
      <button onClick={handleSubmit}>Submit</button>
      <p>{message}</p>
    </div>
  );

  return (
    <div className="HostGame" style={{ display: 'block' }}>
      <h1>Host Game</h1>
      {isCreating ? (
        createForm
      ) : (
        <WaitingRoom name={name} roomCode={roomCode} />
      )}
      {/* TODO: Customize playing deck */}
    </div>
  );
};

export default HostGame;
