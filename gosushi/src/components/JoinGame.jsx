import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:4001';
const socket = socketIOClient(ENDPOINT);

const JoinGame = () => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('newPlayer', data => {
      if (!Array.isArray(data)) {
        setMessage(data);
      } else {
        setPlayers(data);
      }
    });
  }, []);

  const handleSubmit = () => {
    socket.emit('joinGame', name, roomCode);
    setMessage('Loading...');
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
      <button onClick={handleSubmit}>Submit</button>
      <p>{message}</p>
    </div>
  );

  const roomDetails = (
    <div>
      <p>Room code: {roomCode}</p>
      <p>Player name: {name}</p>
      {players ? (
        players.map(player => (
          <div key={player}>{`${player} has joined the game`}</div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );

  const isJoining = !players;

  return (
    <div className="JoinGame" style={{ display: 'block' }}>
      <h1>Join Game</h1>
      {isJoining ? joinForm : roomDetails}
    </div>
  );
};

export default JoinGame;
