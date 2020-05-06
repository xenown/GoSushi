import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { useHistory } from 'react-router-dom';
const ENDPOINT = 'http://127.0.0.1:4001';
const socket = socketIOClient(ENDPOINT);

const HostGame = () => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [numPlayers, setNumPlayers] = useState('');
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

  useEffect(() => {
    socket.on('startGame', code => {
      history.push(`/game/${code}`);
    });
  }, [history]);

  const handleSubmit = () => {
    const menu = {
      roll: 'Maki',
      appetizer: ['Tempura', 'Sashimi', 'Dumpling'],
      special: ['Chopsticks', 'Wasabi'],
      dessert: 'Pudding',
    };
    socket.emit('hostGame', menu, numPlayers, roomCode, name);
    setMessage('Loading...');
  };

  const isCreating = !players;

  const createForm = (
    <div>
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
            setNumPlayers(e.target.value);
          }}
        />
      </div>
      <div>
        Enter your room code
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
      {/* TODO: Display number of players missing, Move this code to a WaitingRoom component */}
      {players &&
        players.map(player => (
          <div key={player}>{`${player} has joined the game`}</div>
        ))}
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
