import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import socketIOClient from 'socket.io-client';

import './App.css';
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
        <header className="App-header">
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
              <div className="App-route-container">
                <Link className="btn btn-outline-primary" to="/host">
                  Host Game
                </Link>
                <Link className="btn btn-outline-success" to="/join">
                  Join Game
                </Link>
              </div>
            </Route>
          </Switch>
        </header>
      </div>
    </Router>
  );
};

export default App;
