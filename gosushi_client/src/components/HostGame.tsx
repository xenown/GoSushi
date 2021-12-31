import { isEmpty, join, remove } from 'lodash';
import React, { useState, useEffect } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { useHistory } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import DisplayMenu from './DisplayMenu';
import MenuSelection from './MenuSelection';
import WaitingRoom from './WaitingRoom';
import './hostGame.scss';
import { IOptionalMenu, getEmptyMenu } from '../types/IMenu';
import SocketEventEnum, * as sEvents from '../types/socketEvents';
import {
  checkValidMenu,
  invalidMenuOptions,
} from '../utils/menuSelectionUtils';

const dev = process.env.NODE_ENV === 'development';

interface IHostGameProps {
  socket: Socket;
}

const HostGame = ({ socket }: IHostGameProps) => {
  const history = useHistory();
  const [name, setName] = useState('');
  const [numActivePlayers, setNumActivePlayers] = useState(1);
  const [numPlayers, setNumPlayers] = useState(2);
  const [isCreating, setIsCreating] = useState(true);
  const [message, setMessage] = useState('');
  const [menu, setMenu] = useState<IOptionalMenu>(getEmptyMenu());

  const [roomCode, setRoomCode] = useState('');

  // handle socket events
  useEffect(() => {
    const handleActivePlayer = ({ activePlayers }: sEvents.IGetActivePlayersProps) => {
      let currPlayer = activePlayers.find(obj => obj.socketId === socket.id)!;
      console.log(currPlayer);
      setName(currPlayer.name || name);
      setNumActivePlayers(activePlayers.length);
      setNumPlayers(Math.max(activePlayers.length, numPlayers));
    };

    const handleGameCreated = ({ menu, roomCode }: sEvents.IGameInformationProps) => {
      if (!!menu) {
        setIsCreating(false);
      }
      setRoomCode(roomCode);
    };

    const handleNumPlayer = ({ numPlayers: num }: sEvents.IGetNumberPlayersProps) => setNumPlayers(num);

    const handleError = ({ error }: sEvents.IConnectionFailedProps) => setMessage(error);

    socket.on(SocketEventEnum.GAME_INFORMATION, handleGameCreated);
    socket.on(SocketEventEnum.GET_ACTIVE_PLAYERS, handleActivePlayer);
    socket.on(SocketEventEnum.GET_NUMBER_PLAYERS, handleNumPlayer);
    socket.on(SocketEventEnum.CONNECTION_FAILED, handleError);

    return () => {
      socket.off(SocketEventEnum.GAME_INFORMATION, handleGameCreated);
      socket.off(SocketEventEnum.GET_ACTIVE_PLAYERS, handleActivePlayer);
      socket.off(SocketEventEnum.GET_NUMBER_PLAYERS, handleNumPlayer);
      socket.off(SocketEventEnum.CONNECTION_FAILED, handleError);
    };
  }, [socket, numActivePlayers, numPlayers, name]);

  const handleSubmit = () => {
    let msg = checkValidMenu(menu);
    if (msg !== '') {
      setMessage(msg);
      return;
    } else if (name === '') {
      setMessage('Missing player name.');
      return;
    }

    socket.emit(SocketEventEnum.HOST_GAME, { menu, numPlayers, username: name } as sEvents.IHostGameProps);
    setMessage('Loading...');
  };

  const handleBack = () => history.push('/');

  const handleMenu = (menu: IOptionalMenu) => {
    console.log('HOSTGAME MENU:');
    console.log(menu);

    // Remove menu items that are not allowed with the new number of players
    const removedAppetizers = remove(
      menu.appetizers,
      a => !validMenuOption(a, numPlayers)
    );
    const removedSpecials = remove(
      menu.specials,
      s => !validMenuOption(s, numPlayers)
    );

    let msg = '';
    if (!isEmpty(removedAppetizers)) {
      msg += `The following appetizer(s) cannot be chosen when there are ${numPlayers} players: `;
      msg += join(removedAppetizers, ', ') + '. ';
    }
    if (!isEmpty(removedSpecials)) {
      msg += `The following special(s) cannot be chosen when there are ${numPlayers} players: `;
      msg += join(removedSpecials, ', ') + '. ';
    }

    setMenu(menu);
    setMessage(msg);
    socket.emit(SocketEventEnum.BROADCAST_SELECTION, { menu, numPlayers, roomCode } as sEvents.IBroadcastSelectionProps);
  };

  const handleStartGame = () => {
    socket.emit(SocketEventEnum.GAME_INITIATED, { roomCode } as sEvents.IGameInitiatedProps);
  };

  const handleAutoPlayers = () => {
    let msg = checkValidMenu(menu);
    if (msg !== '') {
      setMessage(msg);
      return;
    } else if (name === '') {
      setMessage('Missing player name.');
      return;
    }

    socket.emit(SocketEventEnum.AUTO_PLAYERS, { menu, numPlayers, username: name } as sEvents.IAutoPlayersProps);
    setMessage('Loading...');
  };

  const validMenuOption = (item: string, num: number) =>
    invalidMenuOptions[item] ? !invalidMenuOptions[item].includes(num) : true;

  const handleNumPlayers = (num: number) => {
    let msg = '';
    if (num < numActivePlayers && numActivePlayers > 1) {
      msg += `There are already ${numActivePlayers} players, cannot create a game with only ${num} players.`;
    } else {
      setNumPlayers(num);
    }
    // Remove menu items that are not allowed with the new number of players
    const removedAppetizers = remove(
      menu.appetizers,
      a => !validMenuOption(a, num)
    );
    const removedSpecials = remove(
      menu.specials,
      s => !validMenuOption(s, num)
    );

    if (!isEmpty(removedAppetizers)) {
      msg += `The following appetizer(s) cannot be chosen when there are ${num} players: `;
      msg += join(removedAppetizers, ', ') + '. ';
    }
    if (!isEmpty(removedSpecials)) {
      msg += `The following special(s) cannot be chosen when there are ${num} players: `;
      msg += join(removedSpecials, ', ') + '.';
    }

    setMenu(menu);
    setMessage(msg);
    socket.emit(SocketEventEnum.BROADCAST_SELECTION, { menu, numPlayers: num, roomCode } as sEvents.IBroadcastSelectionProps);
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

      <ButtonGroup className="player-count mb-3">
        <ToggleButton
          id={`2-player`}
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
            id={`${players}-player`}
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
      </ButtonGroup >

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
        <WaitingRoom
          name={name}
          roomCode={roomCode}
          menu={menu}
          socket={socket}
          shouldDisplayMenu={!isCreating}
        />
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
