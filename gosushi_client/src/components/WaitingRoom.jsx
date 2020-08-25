import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import DisplayMenu from './DisplayMenu';
import './common.scss';
import './menuSelection.scss';
import './waitingRoom.scss';

const WaitingRoom = ({ name, roomCode, socket }) => {
  const history = useHistory();
  const [players, setPlayers] = useState([]);
  const [menu, setMenu] = useState({});
  const [numPlayers, setNumPlayers] = useState('');

  useEffect(() => {
    const handlePlayerJoined = (dataPlayers, dataMenu) => {
      if (Array.isArray(dataPlayers)) {
        setPlayers(dataPlayers);
      }
      setMenu(dataMenu);
    };

    const handleNumPlayers = data => setNumPlayers(data);

    const handleStartGame = code => {
      history.push(`/game/${code}`);
    };

    socket.on('playerJoined', handlePlayerJoined);
    socket.on('getNumPlayers', handleNumPlayers);
    socket.on('startGame', handleStartGame);

    return () => {
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('getNumPlayers', handleNumPlayers);
      socket.off('startGame', handleStartGame);
    };
  }, [history, socket]);

  return (
    <div className="mb-3">
      {players.length > 0 && roomCode !== "" ? (
        <div className="center vertical menu-wrapper mb-3">
          <div className="row no-gutters full-width ml-3 mr-3">
            <div className="col-7 flex-column">
              <h4 className="wait-room-subheader">Overview</h4>
              <div className="wait-room-left-pane grow">
                <div className="row">
                  <div className="col-5">
                    <p><b>Room code:</b></p>
                    <p><b>Your name:</b></p>
                    <p><b>Players joined:</b></p>
                  </div>
                  <div className="col-7">
                    <p>{roomCode}</p>
                    <p>{name}</p>
                    <p style={players.length === numPlayers? {color: 'green'} : {color: 'red'}}>
                      {players.length}/{numPlayers}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-5 flex-column">
              <h4 className="wait-room-subheader">Players</h4>
              <div className="wait-room-right-pane grow">
                {players.map(player => (
                  <div key={player}>{`${player}`}</div>
                ))}
              </div>
            </div>
          </div>          
        </div>
      ) : null}
      <DisplayMenu menu={menu} />
    </div>
  );
};

export default WaitingRoom;
