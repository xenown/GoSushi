import React from 'react';
import { Link } from 'react-router-dom';
import './common.scss';
import logo from '../assets/sushigologo.png';

interface IHomeProps {
  hasExistingGames: boolean,
  handleJoinExisting: () => void;
};

const Home = ({ hasExistingGames, handleJoinExisting}: IHomeProps) => {
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
        {hasExistingGames && <div className="btn btn-warning btn-pad" onClick={handleJoinExisting}>Join Existing Game</div>}
        <Link className="btn btn-success btn-pad" to="/join">
          Join Game
        </Link>
        <a
          className="btn btn-info btn-pad"
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
