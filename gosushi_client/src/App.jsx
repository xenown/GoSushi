import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import './App.css';
import HostGame from './components/HostGame';
import JoinGame from './components/JoinGame';
import Board from './components/Board';

const App = () => {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route path="/host">
              <HostGame />
            </Route>
            <Route path="/join">
              <JoinGame />
            </Route>
            <Route path="/game/:roomCode">
              <Board />
            </Route>
            <Route exact path="/">
              <div className="App-route-container">
                <Link to="/host">Host Game</Link>
                <Link to="/join">Join Game</Link>
              </div>
            </Route>
          </Switch>
        </header>
      </div>
    </Router>
  );
};

export default App;
