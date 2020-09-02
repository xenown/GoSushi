import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';
import { useParams, useHistory } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
import MenuSelection from './MenuSelection';
import DisplayMenu from './DisplayMenu';
import {
  invalidMenuOptions,
  MENU_APPETIZER_COUNT,
  MENU_SPECIAL_COUNT,
} from '../utils/menuSelectionUtils';
import './hostGame.scss';

const dev = process.env.NODE_ENV === 'development';

const HostGame = ({ socket }) => {
  const params = useParams();
  const history = useHistory();
  const [name, setName] = useState('');
  const [numActivePlayers, setNumActivePlayers] = useState(1);
  const [numPlayers, setNumPlayers] = useState(2);
  const [isCreating, setIsCreating] = useState(true);
  const [message, setMessage] = useState('');
  const [menu, setMenu] = useState({
    roll: '',
    appetizers: [],
    specials: [],
    dessert: '',
  });

  useEffect(() => {
    const handleActivePlayer = (data, menu) => {
      setName(data[0].name || name);
      setNumActivePlayers(data.length);
      setNumPlayers(Math.max(data.length, numPlayers));

      if (!!menu) {
        setIsCreating(false);
      }
    };

    const handleNumPlayer = data => setNumPlayers(data);

    const handleError = err => setMessage(err);

    socket.on('getActivePlayers', handleActivePlayer);
    socket.on('getNumPlayers', handleNumPlayer);
    socket.on('connectionFailed', handleError);

    return () => {
      socket.off('getActivePlayers', handleActivePlayer);
      socket.off('getNumPlayers', handleNumPlayer);
      socket.off('connectionFailed', handleError);
    };
  }, [socket, numActivePlayers, numPlayers, name]);

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
    } else if (name === '') {
      setMessage('Missing player name.');
      return;
    }

    socket.emit('hostGame', params.roomCode, menu, numPlayers, name);
    setMessage('Loading...');
  };

  const handleBack = () => history.push('/');

  const handleMenu = menu => {
    console.log('HOSTGAME MENU:');
    console.log(menu);

    // Remove menu items that are not allowed with the new number of players
    const removedAppetizers = _.remove(
      menu.appetizers,
      a => !validMenuOption(a, numPlayers)
    );
    const removedSpecials = _.remove(
      menu.specials,
      s => !validMenuOption(s, numPlayers)
    );

    let msg = '';
    if (!_.isEmpty(removedAppetizers)) {
      msg += `The following appetizer(s) cannot be chosen when there are ${numPlayers} players: `;
      msg += _.join(removedAppetizers, ', ') + '. ';
    }
    if (!_.isEmpty(removedSpecials)) {
      msg += `The following special(s) cannot be chosen when there are ${numPlayers} players: `;
      msg += _.join(removedSpecials, ', ') + '. ';
    }

    setMenu(menu);
    setMessage(msg);
  };

  const handleStartGame = () => {
    socket.emit('gameInitiated', params.roomCode);
  };

  const handleAutoPlayers = () => {
    let msg = checkValidMenu();
    if (msg !== '') {
      setMessage(msg);
      return;
    } else if (name === '') {
      setMessage('Missing player name.');
      return;
    }

    socket.emit('autoPlayers', params.roomCode, menu, numPlayers, name);
    setMessage('Loading...');
  };

  const validMenuOption = (item, num) =>
    invalidMenuOptions[item] ? !invalidMenuOptions[item].includes(num) : true;

  const handleNumPlayers = num => {
    let msg = '';
    if (num < numActivePlayers && numActivePlayers > 1) {
      msg += `There are already ${numActivePlayers} players, cannot create a game with only ${num} players.`;
    } else {
      setNumPlayers(num);
    }
    // Remove menu items that are not allowed with the new number of players
    const removedAppetizers = _.remove(
      menu.appetizers,
      a => !validMenuOption(a, num)
    );
    const removedSpecials = _.remove(
      menu.specials,
      s => !validMenuOption(s, num)
    );

    if (!_.isEmpty(removedAppetizers)) {
      msg += `The following appetizer(s) cannot be chosen when there are ${num} players: `;
      msg += _.join(removedAppetizers, ', ') + '. ';
    }
    if (!_.isEmpty(removedSpecials)) {
      msg += `The following special(s) cannot be chosen when there are ${num} players: `;
      msg += _.join(removedSpecials, ', ') + '.';
    }

    setMenu(menu);
    setMessage(msg);
  };

  const createForm = (
    <div className="center vertical container-hostgame">
      <MenuSelection
        handleMenu={handleMenu}
        menu={menu}
        numPlayers={numPlayers}
      />
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
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
      </div>

      <ButtonGroup className="player-count mb-3" toggle>
        <ToggleButton
          key={`2-player`}
          className="toggle-player-number"
          type="radio"
          name="options"
          value="option0"
          onChange={() => handleNumPlayers(2)}
          checked={2 === numPlayers}
          disabled={2 < numActivePlayers}
        >
          2-player
          <span className="hovertext">{`There are already ${numActivePlayers} players, cannot create a game with only ${2}.`}</span>
        </ToggleButton>
        {[3, 4, 5, 6, 7, 8].map((players, index) => (
          <ToggleButton
            key={`${players}-player`}
            className="toggle-player-number"
            type="radio"
            name="options"
            value={'option' + index + 1}
            onChange={() => handleNumPlayers(players)}
            checked={players === numPlayers}
            disabled={players < numActivePlayers}
          >
            {players}-player
            <span className="hovertext">{`There are already ${numActivePlayers} players, cannot create a game with only ${players}.`}</span>
          </ToggleButton>
        ))}
      </ButtonGroup>

      <div>
        <p>{message}</p>
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
      </div>
    </div>
  );

  return (
    <div className="full row center">
      <div className="col">
        <h1>Host Game</h1>
        {isCreating && createForm}
        <WaitingRoom name={name} roomCode={params.roomCode} socket={socket} />
        {numActivePlayers === numPlayers && !isCreating && (
          <button
            className="btn btn-success ml-2 mr-2 mb-2"
            onClick={handleStartGame}
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  );
};

export default HostGame;
