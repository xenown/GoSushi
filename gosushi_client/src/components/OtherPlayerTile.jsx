import React, { useState } from 'react';
import { Badge } from 'react-bootstrap';
import CardToggle from './CardToggle';
import Card from './Card';
import './otherPlayerTile.scss';

const OtherPlayerTile = ({ player, isFinished }) => {
  const [showPlayedCards, toggleShowPlayedCards] = useState(true);

  const transform = {
    hover: "scale(6) translateY(25%)",
    noHover: "scale(1) translateY(0%)"
  };
  
  const displayPlayedCard = (card, index) => (
    <Card
      key={`played_${card.name}_${index}`}
      className="other-player-card"
      card={card}
      imageClass="card-image-other-players"
      transform={transform}
    />
  );

  const cardsToShow = showPlayedCards
    ? player.playedCards
    : player.dessertCards;

  return (
    <div className={"container-player-data" + (isFinished ? " finished" : "")}>
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
