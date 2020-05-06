import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import socketIOClient from 'socket.io-client';
const ENDPOINT = 'http://127.0.0.1:4001';

const App = () => {
  const [response, setResponse] = useState('');

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on('FromAPI', (data) => {
      setResponse(data);
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <p>
          It's <time dateTime={response}>{response}</time>
        </p>
      </header>
    </div>
  );
};

export default App;
