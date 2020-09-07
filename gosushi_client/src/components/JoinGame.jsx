import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';

const JoinGame = ({ socket }) => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [message, setMessage] = useState('');
  const [menu, setMenu] = useState({});
  const history = useHistory();

  useEffect(() => {
    const handleActivePlayer = data => {
      let currPlayer = data.find(obj => obj.socketId === socket.id);
      setName(currPlayer.name);
    };

    const handleGameInfo = (menu, roomCode) => {
      setMenu(menu);
      setRoomCode(roomCode);
      setIsJoining(false);
    };

    const handleError = err => setMessage(err);

    const handleQuitGame = () => {
      setName('');
      setMenu({});
      setRoomCode('');
      setIsJoining(true);
      setMessage('Host disconnected - game terminated.');
    };

    socket.on('gameInformation', handleGameInfo);
    socket.on('getActivePlayers', handleActivePlayer);
    socket.on('connectionFailed', handleError);
    socket.on('quitGame', handleQuitGame);

    return () => {
      socket.off('gameInformation', handleGameInfo);
      socket.off('getActivePlayers', handleActivePlayer);
      socket.off('connectionFailed', handleError);
      socket.off('quitGame', handleQuitGame);
    };
  }, [socket]);

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

  const waitingRoomProps = {
    name,
    roomCode,
    menu,
    socket,
    shouldDisplayMenu: true,
  };

  return (
    <div className="full row center">
      <div className="col">
        <h1>Join Game</h1>
        {isJoining && joinForm}
        <WaitingRoom {...waitingRoomProps} />
      </div>
    </div>
  );
};

export default JoinGame;
