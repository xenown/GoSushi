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
import SpecActionsLog from './SpecActionsLog'

const Board = ({ socket }) => {
  const params = useParams();
  const history = useHistory();
  const [hand, setHand] = useState([]);
  const [menu, setMenu] = useState({});
  const [playersData, setPlayersData] = useState([]);

  const [showPlayedCards, toggleShowPlayedCards] = useState(true);

  const [selectedCardIndex, setSelectedCardIndex] = useState(-1);
  const [played, setPlayed] = useState(false);
  const [selectedPlayedCards, setSelectedPlayedCards] = useState([]);

  useEffect(() => {
    socket.emit('boardLoaded', params.roomCode, _.isEmpty(menu));

    const handleDealHand = (hand, playersData) => {
      setHand(hand);
      setPlayersData(playersData);
      setSelectedCardIndex(-1);
      setSelectedPlayedCards([]);
      setPlayed(false);
    };

    const handleMenuData = menuData => {
      setMenu(menuData);
    };

    const handlePlayerStatus = playersData => {
      setPlayersData(playersData);
    };

    const handleUnknownGame = () => {
      history.push('/');
    };

    const handleQuitGame = () => {
      history.push('/join');
    };

    socket.on('sendTurnData', handleDealHand);
    socket.on('sendMenuData', handleMenuData);
    socket.on('playerStatus', handlePlayerStatus);
    socket.on('unknownGame', handleUnknownGame);
    socket.on('quitGame', handleQuitGame);

    return () => {
      socket.off('sendTurnData', handleDealHand);
      socket.off('sendMenuData', handleMenuData);
      socket.off('playerStatus', handlePlayerStatus);
      socket.off('unknownGame', handleUnknownGame);
      socket.off('quitGame', handleQuitGame);
    };
  }, [params.roomCode, socket, menu, history]);

  const currPlayer = playersData[0];
  const otherPlayerData = playersData.slice(1);

  const handleSelectCardIndex = index => {
    if (!currPlayer.isFinished) {
      setSelectedCardIndex(index === selectedCardIndex ? -1 : index);
    }
  };

  const handleSelectPlayedCard = index => {
    if (!currPlayer.isFinished) {
      const newSelected = _.includes(selectedPlayedCards, index)
        ? selectedPlayedCards.filter(el => el !== index)
        : selectedPlayedCards.concat(index);
      setSelectedPlayedCards(newSelected);
    }
  };

  const displayPlayedCard = (card, index) => {
    let canUse =
      (card.name === 'Chopsticks' || card.name === 'Spoon') && hand.length > 1;

    let className = canUse ? 'card-played-playable' : 'card-played';

    const transform = {
      hover: 'scale(2) translateY(0%)',
      noHover: 'scale(1) translateY(0%)',
      selected: 'scale(1) translateY(-10%)',
    };

    return (
      <Card
        card={card}
        index={index}
        className={className}
        isSelected={showPlayedCards && _.includes(selectedPlayedCards, index)}
        handleSelectCard={canUse ? handleSelectPlayedCard : () => {}}
        scaleUpFactor={2}
        imageClass="card-image-played"
        transform={transform}
        key={`my-played-cards-${index}`}
      />
    );
  };

  const handleFinishTurn = () => {
    setPlayed(true);
    const playedSpecials = selectedPlayedCards.map(
      e => currPlayer.playedCards[e]
    );
    socket.emit(
      'finishTurn',
      params.roomCode,
      hand[selectedCardIndex],
      playedSpecials
    );
  };

  const renderActions = () => {
    return (
      <div className="container-buttons">
        <div>Your points: {currPlayer && currPlayer.points}</div>
        <Button
          className="button"
          disabled={selectedCardIndex === -1 || played}
          onClick={handleFinishTurn}
        >
          Finish Turn
          <span className="hovertext">You cannot undo this action</span>
        </Button>
        <CardToggle
          checked={showPlayedCards}
          onClick={() => toggleShowPlayedCards(!showPlayedCards)}
        />
      </div>
    );
  };

  const cardsToShow = currPlayer ? (showPlayedCards ? currPlayer.playedCards : currPlayer.dessertCards) : null;

  return (
    <div className="board">
      {!_.isEmpty(menu) && <Drawer menu={menu} />}
      <SpecialModal socket={socket} />
      <ResultsModal socket={socket} />
      <SpecActionsLog socket={socket} />
      <OtherPlayerGrid data={otherPlayerData} />
      <div className="played-cards">
        <div className="container-played-cards">
          {currPlayer && cardsToShow.map(displayPlayedCard)}
        </div>
      </div>
      <div className="action-bar">
        {renderActions()}
        <div className="container-hand">
          {hand.map((card, index) => (
            <Card
              card={card}
              className="card-playable"
              index={index}
              isSelected={selectedCardIndex === index}
              handleSelectCard={handleSelectCardIndex}
              scaleUpFactor={2}
              imageClass="card-image-hand"
              key={`hand_${card.name}_${index}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;
