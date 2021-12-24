import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import socketIOClient from 'socket.io-client';

import './App.scss';
import Home from './components/Home';
import HostGame from './components/HostGame';
import JoinGame from './components/JoinGame';
import Board from './components/Board';
import RejoinModal from './components/RejoinModal';
import ConnectionModal from './components/ConnectionModal';

const port = process.env.PORT || 5000;
const ENDPOINT = window ? window.location.origin.toString() : 'http://127.0.0.1:'+ port;
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
              <Home hasExistingGames={existingGames.length > 0} handleJoinExisting={() => { setModalOpen(true); }} />
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
