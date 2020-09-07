import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import DisplayMenu from './DisplayMenu';
import './menuSelection.scss';
import './waitingRoom.scss';

const WaitingRoom = ({ name, roomCode, menu, shouldDisplayMenu, socket }) => {
  const history = useHistory();
  const [players, setPlayers] = useState([]);
  const [numPlayers, setNumPlayers] = useState(0);

  useEffect(() => {
    const handleActivePlayer = dataPlayers => {
      setPlayers(dataPlayers);
    };

    const handleNumPlayers = data => setNumPlayers(data);

    const handleStartGame = code => {
      history.push(`/game/${code}`);
    };

    const handleQuitGame = () => {
      setPlayers([]);
      setNumPlayers(0);
    };

    socket.on('getActivePlayers', handleActivePlayer);
    socket.on('getNumPlayers', handleNumPlayers);
    socket.on('startGame', handleStartGame);
    socket.on('quitGame', handleQuitGame);

    return () => {
      socket.off('getActivePlayers', handleActivePlayer);
      socket.off('getNumPlayers', handleNumPlayers);
      socket.off('startGame', handleStartGame);
      socket.off('quitGame', handleQuitGame);
    };
  }, [history, socket]);

  return (
    <div className="mb-3">
      {players.length > 0 && roomCode !== '' ? (
        <div className="center vertical menu-wrapper mb-3">
          <div className="row no-gutters full-width ml-3 mr-3">
            <div className="col-7 flex-column">
              <h4 className="wait-room-subheader">Overview</h4>
              <div className="wait-room-left-pane grow">
                <div className="row">
                  <div className="col-5">
                    <p>
                      <b>Room code:</b>
                    </p>
                    <p>
                      <b>Your name:</b>
                    </p>
                    <p>
                      <b>Players joined:</b>
                    </p>
                    <p>
                      <b>Rules:</b>
                    </p>
                  </div>
                  <div className="col-7">
                    <p>{roomCode}</p>
                    <p>{name}</p>
                    <p
                      style={
                        players.length === numPlayers
                          ? { color: 'green' }
                          : { color: 'red' }
                      }
                    >
                      {players.length}/{numPlayers || '?'}
                    </p>
                    <a
                      href="https://gamewright.com/pdfs/Rules/SushiGoPartyTM-RULES.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read the Rules
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-5 flex-column">
              <h4 className="wait-room-subheader">Players</h4>
              <div className="wait-room-right-pane grow">
                {players.map(player => (
                  <div key={player.name}>{`${player.name}`}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {shouldDisplayMenu && <DisplayMenu menu={menu} />}
    </div>
  );
};

export default WaitingRoom;
