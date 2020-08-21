import React, { useState } from 'react';

import CardToggle from './CardToggle';
import { getCardImage } from '../utils/getCardImage';
import './otherPlayerTile.scss';

const OtherPlayerTile = ({ player }) => {
  const [showPlayedCards, toggleShowPlayedCards] = useState(true);

  const displayPlayedCard = (card, index) => (
    <div key={`played_${card.name}_${index}`}>
      <img
        className="card-image-other-players"
        src={getCardImage(card)}
        alt={card.name}
      />
    </div>
  );

  const cardsToShow = showPlayedCards
    ? player.playedCards
    : player.dessertCards;

  return (
    <div className="container-player-data">
      <div className="points-circle">
        <span className="points-text">{player.points}</span>
      </div>
      <div className="toggle-row">
        <CardToggle
          checked={showPlayedCards}
          onClick={() => toggleShowPlayedCards(!showPlayedCards)}
        />
      </div>
      <div className="container-cards">
        {cardsToShow.map(displayPlayedCard)}
      </div>
      <div className="player-name">{player.name}</div>
    </div>
  );
};

export default OtherPlayerTile;
