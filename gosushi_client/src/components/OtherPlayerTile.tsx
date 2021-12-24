import React, { useState } from 'react';
import { Badge } from 'react-bootstrap';
import CardToggle from './CardToggle';
import Card from './Card';
import './otherPlayerTile.scss';
import ICard from '../types/ICard';
import IPlayer from '../types/IPlayer';

interface IOtherPlayerTileProps {
  player: IPlayer;
  isFinished: boolean;
};

const OtherPlayerTile = ({ player, isFinished }: IOtherPlayerTileProps) => {
  const [showPlayedCards, toggleShowPlayedCards] = useState(true);

  const transform = {
    hover: "scale(6) translateY(25%)",
    noHover: "scale(1) translateY(0%)"
  };
  
  const displayPlayedCard = (card: ICard, index: number) => (
    <Card
      key={`played_${card.name}_${index}`}
      className="other-player-card"
      card={card}
      index={index}
      isSelected={false}
      handleSelectCard={(index: number) => {}}
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
