import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import './common.scss';
const logo = require('../assets/sushigologo.png');

const Home = ({ endpoint }) => {
  const history = useHistory();
  const handleHostClick = () => {
    console.log('host clicked');
    fetch(`${endpoint}/generateRoomCode`)
      .then(res => res.json())
      .then(res => {
        console.log(res.roomCode);
        history.push(`/host/${res.roomCode}`);
      });
  };

  return (
    <>
      <div className="App-logo">
        <img src={logo} style={{ height: '40vh' }} alt="logo" />
      </div>
      <div className="transition"></div>
      <div className="App-route-container">
        <Link className="btn btn-danger" onClick={handleHostClick}>
          Host Game
        </Link>
        <Link className="btn btn-success" to="/join/new">
          Join Game
        </Link>
        <a
          className="btn btn-info"
          href="https://gamewright.com/pdfs/Rules/SushiGoPartyTM-RULES.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Rules
        </a>
      </div>
    </>
  );
};

export default Home;
