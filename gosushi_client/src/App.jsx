import React from 'react';
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
const logo = require('./assets/sushigologo.png');

const serverport = process.env.SERVERPORT || 4001;
const ENDPOINT = 'http://127.0.0.1:' + serverport;
console.log(ENDPOINT);
const socket = socketIOClient(ENDPOINT);

const App = () => {
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
                <Link className="btn btn-danger" to="/host">
                  Host Game
                </Link>
                <Link className="btn btn-success" to="/join">
                  Join Game
                </Link>
              </div>
            </Route>
            <Redirect from="/*" to="/" />
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default App;
