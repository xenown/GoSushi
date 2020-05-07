import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { useHistory } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
const ENDPOINT = 'http://127.0.0.1:4001';
const socket = socketIOClient(ENDPOINT);

const JoinGame = () => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoinging] = useState(true);
  const [message, setMessage] = useState('');
  const history = useHistory();

  useEffect(() => {
    const handleNewPlayer = data => {
      if (!Array.isArray(data)) {
        setMessage(data);
      } else {
        setIsJoinging(false);
      }
    };

    socket.on('newPlayer', handleNewPlayer);

    return () => {
      socket.off('newPlayer', handleNewPlayer);
    };
  }, []);

  const handleSubmit = () => {
    socket.emit('joinGame', name, roomCode);
    setMessage('Loading...');
  };

  const handleBack = () => {
    history.push('/');
  };

  const joinForm = (
    <div>
      <div>
        Enter your name
        <input type="text" onChange={e => setName(e.target.value)} />
      </div>
      <div>
        Enter the room code
        <input type="text" onChange={e => setRoomCode(e.target.value)} />
      </div>
      <button onClick={handleBack}>Back</button>
      <button onClick={handleSubmit}>Submit</button>
      <p>{message}</p>
    </div>
  );

  return (
    <div className="JoinGame" style={{ display: 'block' }}>
      <h1>Join Game</h1>
      {isJoining ? joinForm : <WaitingRoom name={name} roomCode={roomCode} />}
    </div>
  );
};

export default JoinGame;
