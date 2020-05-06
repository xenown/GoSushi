import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import logo from './logo.svg';
import './App.css';
import HostGame from './components/HostGame';
import JoinGame from './components/JoinGame';

const App = () => {
	return (
		<Router>
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<Switch>
						<Route path="/host">
							<HostGame />
						</Route>
						<Route path="/join">
							<JoinGame />
						</Route>
						<Route exact path="/">
							<div>
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
