import React, { useState } from 'react';
import { Badge } from 'react-bootstrap';
import CardToggle from './CardToggle';
import Card from './Card';
import './otherPlayerTile.scss';

const OtherPlayerTile = ({ player }) => {
  const [showPlayedCards, toggleShowPlayedCards] = useState(true);

  const transform = {
    hover: "translateY(25%)",
    noHover: "translateY(0%)"
  };
  
  const displayPlayedCard = (card, index) => (
    <div key={`played_${card.name}_${index}`}>
      <Card 
        card={card}
        imageClass="card-image-other-players"
        scaleUpFactor={4}
        transform={transform}
      />
    </div>
  );

  const cardsToShow = showPlayedCards
    ? player.playedCards
    : player.dessertCards;

  return (
    <div className="container-player-data">
      <Badge className="points-circle" variant="light">{player.points}</Badge>
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
