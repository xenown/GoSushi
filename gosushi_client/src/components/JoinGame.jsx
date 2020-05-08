import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';

const JoinGame = ({ socket }) => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [message, setMessage] = useState('');
  const history = useHistory();

  useEffect(() => {
    const handlePlayerJoined = data => {
      if (!Array.isArray(data)) {
        setMessage(data);
      } else {
        setIsJoining(false);
      }
    };

    socket.on('playerJoined', handlePlayerJoined);

    return () => {
      socket.off('playerJoined', handlePlayerJoined);
    };
  }, [socket]);

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
      {isJoining && joinForm}
      <WaitingRoom name={name} roomCode={roomCode} socket={socket} />
    </div>
  );
};

export default JoinGame;
