import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
import MenuSelection from './MenuSelection';
import DisplayMenu from './DisplayMenu';
import {
  MENU_APPETIZER_COUNT,
  MENU_SPECIAL_COUNT,
} from '../utils/menuSelectionUtils';

const HostGame = ({ socket }) => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [numPlayers, setNumPlayers] = useState('');
  const [isCreating, setIsCreating] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState('');
  const [menu, setMenu] = useState({roll: '', appetizers: [], specials: [], dessert: ""});

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
    socket.on('getRoomCode', (data) => setRoomCode(data));
    socket.on('playerJoined', handleNewPlayer);
    socket.on('roomFilled', handleRoomFilled);

    return () => {
      socket.off('playerJoined', handleNewPlayer);
      socket.off('roomFilled', handleRoomFilled);
    };
  }, [socket]);

  const handleSubmit = () => {
    let msg = '';
    if (menu.roll === '') {
      msg += 'Missing a roll.\n';
    }
    if (menu.appetizers.length < MENU_APPETIZER_COUNT) {
      let diff = MENU_APPETIZER_COUNT - menu.appetizers.length;
      msg += `Missing ${diff} appetizer${diff > 1 ? 's' : ''}.\n`;
    }
    if (menu.specials.length < MENU_SPECIAL_COUNT) {
      let diff = MENU_SPECIAL_COUNT - menu.specials.length;
      msg += `Missing ${diff} special${diff > 1 ? 's' : ''}.\n`;
    }
    if (menu.dessert === '') {
      msg += 'Missing a dessert.\n';
    }
  
    if (msg !== '') {
      setMessage(msg);
      return;
    }
  
    socket.emit('hostGame', menu, numPlayers, name);
    setMessage('Loading...');
  };

  const handleBack = () => history.push('/');

  const handleMenu = menu => {
    console.log("HOSTGAME MENU:");
    console.log(menu);
    setMenu(menu);
  };

  const handleStartGame = () => {
    socket.emit('gameInitiated', roomCode);
  };

  const createForm = (
    <div>
      <MenuSelection handleMenu={handleMenu} menu={menu} />
      <DisplayMenu menu={menu} />
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
      <button onClick={handleBack}>Back</button>
      <button onClick={handleSubmit}>Submit</button>
      <p>{message}</p>
    </div>
  );

  console.log('state of: ', menu);

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
