import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
import './common.scss';

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
    <div className="center vertical">
      <div className="form-group">
        <label>Enter your name</label>
        <input 
          type="text" 
          className="form-control"
          aria-label="Name"
          aria-describedby="inputGroup-sizing-default"
          onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Enter the room code</label>
          <input 
            type="text"
            className="form-control"
            aria-label="Code"
            aria-describedby="inputGroup-sizing-default"
            onChange={e => setRoomCode(e.target.value)} />
      </div>
      <div>
        <button className="btn btn-danger ml-2 mr-2" onClick={handleBack}>Back</button>
        <button className="btn btn-success ml-2 mr-2" onClick={handleSubmit}>Submit</button>
        <p>{message}</p>
      </div>
    </div>
  );

  return (
    <div className="full row center">
      <div className="col">
        <h1>Join Game</h1>
        {isJoining && joinForm}
        <WaitingRoom name={name} roomCode={roomCode} socket={socket} />
      </div>
    </div>
  );
};

export default JoinGame;
