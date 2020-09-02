import React from 'react';
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
            <Route path="/host/:roomCode">
              <HostGame socket={socket} />
            </Route>
            <Route path="/join/:roomCode">
              <JoinGame socket={socket} />
            </Route>
            <Route path="/game/:roomCode">
              <Board socket={socket} />
            </Route>
            <Route exact path="/">
              <Home endpoint={ENDPOINT} />
            </Route>
            <Redirect from="/join" to="/join/new" />
            <Redirect from="/*" to="/" />
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default App;
