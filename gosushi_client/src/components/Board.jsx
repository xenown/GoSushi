import _ from 'lodash';
import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import SpecialModal from './SpecialModal';
import ResultsModal from './ResultsModal';
import OtherPlayerGrid from './OtherPlayerGrid';
import CardToggle from './CardToggle';
import Card from './Card';
import './board.scss';
import Drawer from './MenuDrawer';


const Board = ({ socket }) => {
  const params = useParams();
  const history = useHistory();
  const [hand, setHand] = useState([]);
  const [menu, setMenu] = useState({});
  const [playersData, setPlayersData] = useState([]);

  const [showPlayedCards, toggleShowPlayedCards] = useState(true);

  const [selectedCardIndex, setSelectedCardIndex] = useState(-1);
  const [played, setPlayed] = useState(false);
  const [selectedPlayedCard, setSelectedPlayedCard] = useState(-1);
  const [usePlayedCard, setUsePlayedCard] = useState(false);

  useEffect(() => {
    socket.emit('boardLoaded', params.roomCode, _.isEmpty(menu));

    const handleDealHand = (hand, playersData) => {
      setHand(hand);
      setPlayersData(playersData);
      setSelectedCardIndex(-1);
      setSelectedPlayedCard(-1);
      setPlayed(false);
      setUsePlayedCard(false);
    };

    const handleMenuData = menuData => {
      setMenu(menuData);
    };

    const handleUnknownGame = () => {
      history.push('/');
    }

    socket.on('sendTurnData', handleDealHand);
    socket.on('sendMenuData', handleMenuData);
    socket.on('unknownGame', handleUnknownGame);

    return () => {
      socket.off('sendTurnData', handleDealHand);
      socket.off('sendMenuData', handleMenuData);
      socket.off('unknownGame', handleUnknownGame);
    };
  }, [params.roomCode, socket, menu, history]);
  
  const handleSelectCardIndex = index => {
    setSelectedCardIndex(index === selectedCardIndex ? -1 : index);
    setSelectedPlayedCard(-1);
  };

  const handleSelectPlayedCard = index => {
    setSelectedCardIndex(-1);
    setSelectedPlayedCard(index === selectedPlayedCard ? -1 : index);
  };

  const displayPlayedCard = (card, index) => {
    let canUse =
      (card.name === 'Chopsticks' || card.name === 'Spoon') && hand.length > 1;

    let className = canUse ? 'card-played-playable' : 'card-played';

    const transform = {
      hover: "scale(2) translateY(0%)",
      noHover: "scale(1) translateY(0%)",
      selected: "scale(1) translateY(-10%)"
    };

    return (
      <Card 
        card={card}
        index={index}
        className={className} 
        isSelected={selectedPlayedCard === index}
        handleSelectCard={canUse ? handleSelectPlayedCard : () => {}}
        scaleUpFactor={2}
        imageClass="card-image-played"
        transform={transform}
        key={`my-played-cards-${index}`}
      />
    );
  };

  const renderActions = () => {
    return (
      <div className="container-buttons">
        <div>Your points: {playersData[0] && playersData[0].points}</div>
        <Button
          className="button"
          disabled={selectedCardIndex === -1 || played || !showPlayedCards}
          onClick={() => {
            setPlayed(true);
            socket.emit(
              'cardSelected',
              params.roomCode,
              hand[selectedCardIndex]
            );
          }}
        >
          {'Play card (you cannot undo this action)'}
        </Button>
        <Button
          className="button"
          disabled={selectedPlayedCard === -1 || usePlayedCard || !showPlayedCards}
          onClick={() => {
            setUsePlayedCard(true);
            socket.emit(
              'usePlayedCard',
              params.roomCode,
              currPlayer.playedCards[selectedPlayedCard]
            );
          }}
        >
          Use special card
        </Button>
        <CardToggle
          checked={showPlayedCards}
          onClick={() => toggleShowPlayedCards(!showPlayedCards)}
        />
      </div>
    );
  };

  const currPlayer = playersData[0];
  const otherPlayerData = playersData.slice(1);
  const cardsToShow = showPlayedCards ? hand : playersData[0].dessertCards;

  return (
    <div className="board">
      {!_.isEmpty(menu) && <Drawer menu={menu} />}
      <SpecialModal socket={socket} />
      <ResultsModal socket={socket} />
      <OtherPlayerGrid data={otherPlayerData} />
      <div className="played-cards">
        <div className="container-played-cards">
          {currPlayer && currPlayer.playedCards.map(displayPlayedCard)}
        </div>
      </div>
      <div className="action-bar">
        {renderActions()}
        <div className="container-hand">{cardsToShow.map((card, index) => 
            <Card card={card} 
              className={showPlayedCards ? "card-playable" : "card-played"}
              index={index}
              isSelected={showPlayedCards && selectedCardIndex === index}
              handleSelectCard={showPlayedCards ? handleSelectCardIndex : () => {}}
              scaleUpFactor={2}
              imageClass="card-image-hand"
              key={`hand_${card.name}_${index}`}
            /> )}
        </div>
      </div>
    </div>
  );
};

export default Board;
