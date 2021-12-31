import { Socket } from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
import { IOptionalMenu, getEmptyMenu } from '../types/IMenu';

import SocketEventEnum, * as sEvents from '../types/socketEvents';

interface IJoinGameProps {
  socket: Socket;
}

const JoinGame = ({ socket }: IJoinGameProps) => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [message, setMessage] = useState('');
  const [menu, setMenu] = useState<IOptionalMenu>(getEmptyMenu());
  const history = useHistory();

  useEffect(() => {
    const handleActivePlayer = ({ activePlayers }: sEvents.IGetActivePlayersProps) => {
      let currPlayer = activePlayers.find(obj => obj.socketId === socket.id)!;
      setName(currPlayer.name);
    };

    const handleGameInfo = ({ menu, roomCode }: sEvents.IGameInformationProps) => {
      setMenu(menu || getEmptyMenu());
      setRoomCode(roomCode);
      setIsJoining(false);
    };

    const handleError = ({ error }: sEvents.IConnectionFailedProps) => setMessage(error);

    const handleQuitGame = () => {
      setName('');
      setMenu(getEmptyMenu());
      setRoomCode('');
      setIsJoining(true);
      setMessage('Host disconnected - game terminated.');
    };

    socket.on(SocketEventEnum.GAME_INFORMATION, handleGameInfo);
    socket.on(SocketEventEnum.GET_ACTIVE_PLAYERS, handleActivePlayer);
    socket.on(SocketEventEnum.CONNECTION_FAILED, handleError);
    socket.on(SocketEventEnum.QUIT_GAME, handleQuitGame);

    return () => {
      socket.off(SocketEventEnum.GAME_INFORMATION, handleGameInfo);
      socket.off(SocketEventEnum.GET_ACTIVE_PLAYERS, handleActivePlayer);
      socket.off(SocketEventEnum.CONNECTION_FAILED, handleError);
      socket.off(SocketEventEnum.QUIT_GAME, handleQuitGame);
    };
  }, [socket]);

  const handleSubmit = () => {
    if (name === '') {
      setMessage('Missing player name.');
      return;
    }
    socket.emit(SocketEventEnum.JOIN_GAME, { username: name, roomCode } as sEvents.IJoinGameProps);
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
        <WaitingRoom name={name} roomCode={roomCode} menu={menu} socket={socket} shouldDisplayMenu={!isJoining} />
      </div>
    </div>
  );
};

export default JoinGame;
