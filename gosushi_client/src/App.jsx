import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import socketIOClient from 'socket.io-client';

import './App.scss';
import HostGame from './components/HostGame';
import JoinGame from './components/JoinGame';
import Board from './components/Board';
import RejoinModal from './components/RejoinModal';
import ConnectionModal from './components/ConnectionModal';
const logo = require('./assets/sushigologo.png');

const serverport = process.env.SERVERPORT || 4001;
const ENDPOINT = 'http://127.0.0.1:' + serverport;
// const ENDPOINT = 'http://192.168.1.106:' + serverport;
console.log(ENDPOINT);
const socket = socketIOClient(ENDPOINT);

const App = () => {
  const [existingGames, setExistingGames] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [disconnectedMsg, setDisconnectedMsg] = useState("");

  useEffect(() => {
    const handleRejoinOptions = (rooms) => { setExistingGames(rooms); setModalOpen(true); };
    const handleConnect = () => { 
      setConnected(true); 
      setDisconnectedMsg("");
    };
    const handleConnectError = (error) => {
      setConnected(false);
      setDisconnectedMsg("Unable to connect. Trying again...");
      socket.connect();
    };
    const handleDisconnection = (reason) => {
      setConnected(false);
      setDisconnectedMsg(reason === 'io server disconnect' ? "Server disconnected. Reconnecting..." : "Client disconnected. Reconnecting...");
      socket.connect();
    };

    socket.on('connect', handleConnect);
    socket.on('connect_error', handleConnectError);
    socket.on('disconnect', handleDisconnection);
    socket.on('rejoinOption', handleRejoinOptions);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('disconnect', handleDisconnection);
      socket.off('rejoinOption', handleRejoinOptions);
    };
  });

  return (
    <Router>
      <div className="App">
        <div className="App-content">
          <Switch>
            <Route path="/host">
              <HostGame socket={socket} />
            </Route>
            <Route path="/join">
              <JoinGame socket={socket} />
            </Route>
            <Route path="/game/:roomCode">
              <Board socket={socket} />
            </Route>
            <Route exact path="/">
              <div className="App-logo">
                <img src={logo} style={{ height: '40vh' }} alt="logo" />
              </div>
              <div className="transition"></div>
              <div className="App-route-container">
                <Link className="btn btn-danger btn-pad" to="/host">
                  Host Game
                </Link>
                {existingGames.length > 0 && <div className="btn btn-warning btn-pad" onClick={ () => { setModalOpen(true); } }>Join Existing Game</div>}
                <Link className="btn btn-success btn-pad" to="/join">
                  Join Game
                </Link>
              </div>
            </Route>
            <Redirect from="/*" to="/" />
          </Switch>
          <RejoinModal socket={socket} rooms={existingGames} open={modalOpen} hide={() => setModalOpen(false)} />
          <ConnectionModal open={!connected} message={disconnectedMsg} />
        </div>
      </div>
    </Router>
  );
};

export default App;
