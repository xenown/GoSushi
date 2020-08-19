import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
import MenuSelection from './MenuSelection';
import DisplayMenu from './DisplayMenu';
import {
  invalidMenuOptions,
  MENU_APPETIZER_COUNT,
  MENU_SPECIAL_COUNT,
} from '../utils/menuSelectionUtils';
import './common.scss';

const dev = process.env.NODE_ENV === 'development';

const HostGame = ({ socket }) => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [numPlayers, setNumPlayers] = useState(2);
  const [isCreating, setIsCreating] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState('');
  const [menu, setMenu] = useState({
    roll: '',
    appetizers: [],
    specials: [],
    dessert: '',
  });

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
    socket.on('getRoomCode', data => setRoomCode(data));
    socket.on('playerJoined', handleNewPlayer);
    socket.on('roomFilled', handleRoomFilled);

    return () => {
      socket.off('playerJoined', handleNewPlayer);
      socket.off('roomFilled', handleRoomFilled);
    };
  }, [socket]);

  const checkValidMenu = () => {
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
    return msg;
  };

  const handleSubmit = () => {
    let msg = checkValidMenu();
    if (msg !== '') {
      setMessage(msg);
      return;
    } else if (name === ''){
      setMessage("Missing player name.");
      return;
    }

    socket.emit('hostGame', menu, numPlayers, name);
    setMessage('Loading...');
  };

  const handleBack = () => history.push('/');

  const handleMenu = menu => {
    console.log('HOSTGAME MENU:');
    console.log(menu);

    // Remove menu items that are not allowed with the current number of players
    menu.appetizers = menu.appetizers.filter(a => validMenuOption(a, numPlayers));
    menu.specials = menu.specials.filter(s => validMenuOption(s, numPlayers));

    setMenu(menu);
  };

  const handleStartGame = () => {
    socket.emit('gameInitiated', roomCode);
  };

  const handleAutoPlayers = () => {
    let msg = checkValidMenu();
    if (msg !== '') {
      setMessage(msg);
      return;
    }

    socket.emit('autoPlayers', menu, numPlayers, name);
    setMessage('Loading...');
  };

  const validMenuOption = (item, num) => invalidMenuOptions[item] ? !invalidMenuOptions[item].includes(num) : true;

  const handleNumPlayers = num => {
    // Remove menu items that are not allowed with the new number of players
    menu.appetizers = menu.appetizers.filter(a => validMenuOption(a, num));
    menu.specials = menu.specials.filter(s => validMenuOption(s, num));

    setNumPlayers(num);
    setMenu(menu);
  };

  const createForm = (
    <div className="center vertical">
      <MenuSelection handleMenu={handleMenu} menu={menu} numPlayers={numPlayers}/>
      <DisplayMenu menu={menu} />
      <br />

      <div className="col-auto">
        <div className="input-group mb-3 col-auto">
          <div className="input-group-prepend">
            <span className="input-group-text" id="inputGroup-sizing-default">
              Name
            </span>
          </div>
          <input
            type="text"
            className="form-control"
            aria-label="Name"
            aria-describedby="inputGroup-sizing-default"
            onChange={e => setName(e.target.value)}
          />
        </div>
      </div>

      <div
        className="player-count btn-group btn-group-toggle mb-3"
        data-toggle="buttons"
      >
        <label
          className="btn btn-primary active"
          key={`2-player`}
          onClick={() => setNumPlayers(2)}
        >
          <input
            type="radio"
            name="options"
            id="option0"
            autoComplete="off"
            defaultChecked
          />
          2-player
        </label>
        {[3, 4, 5, 6, 7, 8].map((players, index) => (
          <label
            className="btn btn-primary"
            key={`${players}-player`}
            onClick={() => handleNumPlayers(players)}
          >
            <input
              type="radio"
              name="options"
              id={'option' + index + 1}
              autoComplete="off"
            />
            {players}-player
          </label>
        ))}
      </div>

      <div>
        <button className="btn btn-danger ml-2 mr-2" onClick={handleBack}>
          Back
        </button>
        <button className="btn btn-success ml-2 mr-2" onClick={handleSubmit}>
          Submit
        </button>
        {dev && (
          <button
            className="btn btn-success ml-2 mr-2"
            onClick={handleAutoPlayers}
          >
            Auto other players
          </button>
        )}
        <p>{message}</p>
      </div>
    </div>
  );

  return (
    <div className="full row center">
      <div className="col">
        <h1>Host Game</h1>
        {isCreating && createForm}
        <WaitingRoom name={name} roomCode={roomCode} socket={socket} />
        {isReady && <button className="btn btn-success ml-2 mr-2" onClick={handleStartGame}>Start Game</button>}
      </div>
    </div>
  );
};

export default HostGame;
