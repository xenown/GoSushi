import React from 'react';
import { Link } from 'react-router-dom';
import './common.scss';
const logo = require('../assets/sushigologo.png');

const Home = () => {
  return (
    <>
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
