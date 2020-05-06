import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:4001';
const socket = socketIOClient(ENDPOINT);

const HostGame = () => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState('');
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    socket.on('newPlayer', data => {
      setPlayers(data);
    });
  }, []);

  const handleSubmit = () => {
    const menu = {
      roll: 'Maki',
      appetizer: ['Tempura', 'Sashimi', 'Dumpling'],
      special: ['Chopsticks', 'Wasabi'],
      dessert: 'Pudding',
    };
    socket.emit('hostGame', menu, 5, roomCode, name);
    setIsCreating(false);
  };

  const createForm = (
    <div>
      <div>
        Enter your name
        <input type="text" onChange={e => setName(e.target.value)} />
      </div>
      <div>
        Enter your room code
        <input type="text" onChange={e => setRoomCode(e.target.value)} />
      </div>
      <button onClick={handleSubmit}>Submit</button>
      {/* Add messages or loading... */}
    </div>
  );

  const roomDetails = (
    <div>
      <p>Room code: {roomCode}</p>
      <p>Player name: {name}</p>
      {/* TODO: Display number of players missing, Move this code to a WaitingRoom component */}
      {players ? (
        players.map(player => (
          <div key={player}>{`${player} has joined the game`}</div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );

  return (
    <div className="HostGame" style={{ display: 'block' }}>
      <h1>Host Game</h1>
      {isCreating ? createForm : roomDetails}
      {/* TODO: Customize playing deck */}
    </div>
  );
};

export default HostGame;
