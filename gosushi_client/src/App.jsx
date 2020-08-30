import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import { Button } from 'react-bootstrap';

import './App.scss';
import HostGame from './components/HostGame';
import JoinGame from './components/JoinGame';
import Board from './components/Board';
import RejoinModal from './components/RejoinModal';
const logo = require('./assets/sushigologo.png');

const serverport = process.env.SERVERPORT || 4001;
const ENDPOINT = 'http://127.0.0.1:' + serverport;
console.log(ENDPOINT);
const socket = socketIOClient(ENDPOINT);

const App = () => {
  const [existingGames, setExistingGames] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handleRejoinOptions = (rooms) => { setExistingGames(rooms); setModalOpen(true); };

    socket.on('rejoinOption', handleRejoinOptions);

    return () => {
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
        </div>
      </div>
    </Router>
  );
};

export default App;
