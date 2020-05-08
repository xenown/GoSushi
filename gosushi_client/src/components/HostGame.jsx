import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
import MenuSelection from './MenuSelection';

const HostGame = ({ socket }) => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [numPlayers, setNumPlayers] = useState('');
  const [isCreating, setIsCreating] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState('');
  const [menu, setMenu] = useState({});

  useEffect(() => {
    const handleNewPlayer = data => {
      if (!Array.isArray(data)) {
        setMessage(data);
      } else {
        setMessage(data);
        setIsCreating(false);
      }
    };

    const handleRoomFilled = () => {
      setIsReady(true);
    };

    socket.on('playerJoined', handleNewPlayer);
    socket.on('roomFilled', handleRoomFilled);

    return () => {
      socket.off('playerJoined', handleNewPlayer);
      socket.off('roomFilled', handleRoomFilled);
    };
  }, [socket]);

  const handleSubmit = () => {
    socket.emit('hostGame', menu, numPlayers, roomCode, name);
    setMessage('Loading...');
  };

  const handleBack = () => history.push('/');

  const handleMenu = menu => setMenu(menu);

  const handleStartGame = () => {
    socket.emit('gameInitiated', roomCode);
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
      {isCreating && createForm}
      <WaitingRoom name={name} roomCode={roomCode} socket={socket} />
      {isReady && <button onClick={handleStartGame}>Start Game</button>}
    </div>
  );
};

export default HostGame;
