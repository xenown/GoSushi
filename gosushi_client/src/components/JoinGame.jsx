import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';

const JoinGame = ({ socket }) => {
  const params = useParams();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [message, setMessage] = useState('');
  const history = useHistory();

  useEffect(() => {
    const handleActivePlayer = data => {
      let currPlayer = data.find(obj => obj.socketId === socket.id);
      if (params.roomCode !== 'new') {
        setRoomCode(params.roomCode);
      }
      setName(currPlayer.name);
      setIsJoining(false);
    };

    const handleError = err => setMessage(err);

    const handleQuitGame = () => {
      setName('');
      setRoomCode('');
      setIsJoining(true);
      setMessage('Host disconnected - game terminated.');
    };

    socket.on('getActivePlayers', handleActivePlayer);
    socket.on('connectionFailed', handleError);
    socket.on('quitGame', handleQuitGame);

    return () => {
      socket.off('getActivePlayers', handleActivePlayer);
      socket.off('connectionFailed', handleError);
      socket.off('quitGame', handleQuitGame);
    };
  }, [socket, params.roomCode]);

  const handleSubmit = () => {
    if (name === '') {
      setMessage('Missing player name.');
      return;
    }
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
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Enter the room code</label>
        <input
          type="text"
          className="form-control"
          aria-label="Code"
          aria-describedby="inputGroup-sizing-default"
          onChange={e => setRoomCode(e.target.value)}
        />
      </div>
      <div>
        <p>{message}</p>
        <button className="btn btn-danger ml-2 mr-2" onClick={handleBack}>
          Back
        </button>
        <button className="btn btn-success ml-2 mr-2" onClick={handleSubmit}>
          Submit
        </button>
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
