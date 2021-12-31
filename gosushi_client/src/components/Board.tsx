import { includes, isEqual } from 'lodash';
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useParams, useHistory } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import Card from './Card';
import CardToggle from './CardToggle';
import Drawer from './MenuDrawer';
import ResultsModal from './ResultsModal';
import SpecActionsLog from './SpecActionsLog';
import SpecialModal from './SpecialModal';
import OtherPlayerGrid from './OtherPlayerGrid';
import './board.scss';

import ICard from '../types/ICard';
import IMenu from '../types/IMenu';
import IPlayer from '../types/IPlayer';
import IRouteParams from '../types/IRouteParams';
import SocketEventEnum, * as sEvents from '../types/socketEvents';

interface IBoardProps {
  socket: Socket;
}

const Board = ({ socket }: IBoardProps) => {
  const params= useParams() as IRouteParams;
  const history = useHistory();
  const [hand, setHand] = useState<ICard[]>([]);
  const [menu, setMenu] = useState<IMenu | undefined>(undefined);
  const [playersData, setPlayersData] = useState<IPlayer[]>([]);
  const [roundNumber, updateRoundNumber] = useState(1);

  const [showPlayedCards, toggleShowPlayedCards] = useState(true);

  const [selectedHandCards, setSelectedHandCards] = useState<number[]>([]);
  const [played, setPlayed] = useState(false);
  const [selectedPlayedCards, setSelectedPlayedCards] = useState<number[]>([]);

  useEffect(() => {
    socket.emit(SocketEventEnum.BOARD_LOADED, { roomCode: params.roomCode, sendMenu: !menu } as sEvents.IBoardLoadedProps);

    const handleDealHand = ({ hand, players }: sEvents.ISendTurnDataProps) => {
      setHand(hand);
      setPlayersData(players);
      let selectedIndices: number[] = [];
      players[0].turnCards.forEach(card => {
        selectedIndices.push(hand.findIndex(handCard => isEqual(handCard, card)));
      })
      setSelectedHandCards(selectedIndices);
      selectedIndices = [];
      players[0].turnCardsReuse.forEach(card => {
        selectedIndices.push(players[0].playedCards.findIndex(playedCard => isEqual(playedCard, card)));
      })
      setSelectedPlayedCards(selectedIndices);
      setPlayed(players[0].isFinished);
    };

    const handleMenuData = ({ menu }: sEvents.ISendMenuDataProps) => {
      setMenu(menu);
    };

    const handlePlayerStatus = ({ playersData }: sEvents.IPlayerStatusProps) => {
      setPlayersData(playersData);
    };

    const handleUnknownGame = () => {
      history.push('/');
    };

    const handleRoundUpdate = ({ roundNumber }: sEvents.IUpdateRoundNumberProps) => {
      updateRoundNumber(roundNumber);
    };

    const handleQuitGame = () => {
      history.push('/join');
    };

    socket.on(SocketEventEnum.SEND_TURN_DATA, handleDealHand);
    socket.on(SocketEventEnum.SEND_MENU_DATA, handleMenuData);
    socket.on(SocketEventEnum.PLAYER_STATUS, handlePlayerStatus);
    socket.on(SocketEventEnum.UNKNOWN_GAME, handleUnknownGame);
    socket.on(SocketEventEnum.UPDATE_ROUND_NUMBER, handleRoundUpdate);
    socket.on(SocketEventEnum.QUIT_GAME, handleQuitGame);

    return () => {
      socket.off(SocketEventEnum.SEND_TURN_DATA, handleDealHand);
      socket.off(SocketEventEnum.SEND_MENU_DATA, handleMenuData);
      socket.off(SocketEventEnum.PLAYER_STATUS, handlePlayerStatus);
      socket.off(SocketEventEnum.UNKNOWN_GAME, handleUnknownGame);
      socket.off(SocketEventEnum.UPDATE_ROUND_NUMBER, handleRoundUpdate);
      socket.off(SocketEventEnum.QUIT_GAME, handleQuitGame);
    };
  }, [params.roomCode, socket, menu, history]);

  const currPlayer = playersData[0];
  const otherPlayerData = playersData.slice(1);

  const handleSelectCardIndex = (index: number) => {
    if (!played) {
      setSelectedHandCards(index === selectedHandCards[0] ? [] : [index]);
    }
  };

  const handleSelectPlayedCard = (index: number) => {
    if (!played) {
      const newSelected = includes(selectedPlayedCards, index)
        ? selectedPlayedCards.filter(el => el !== index)
        : selectedPlayedCards.concat(index);
      setSelectedPlayedCards(newSelected);
    }
  };

  const displayPlayedCard = (card: ICard, index: number) => {
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
        isSelected={showPlayedCards && includes(selectedPlayedCards, index)}
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
      SocketEventEnum.FINISH_TURN,
      {
        roomCode: params.roomCode,
        card: hand[selectedHandCards[0]],
        specials: playedSpecials
      } as sEvents.IFinishTurnProps
    );
  };

  const renderActions = () => {
    return (
      <div className="container-buttons">
        <div>Round Number: {roundNumber}</div>
        <div>Your points: {currPlayer && currPlayer.points}</div>
        <Button
          className="button"
          disabled={selectedHandCards.length === 0 || played}
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

  const cardsToShow = currPlayer
    ? showPlayedCards
      ? currPlayer.playedCards
      : currPlayer.dessertCards
    : null;

  return (
    <div className="board">
      {menu && <Drawer menu={menu} />}
      <SpecialModal socket={socket} />
      <ResultsModal socket={socket} playerName={currPlayer ? currPlayer.name : ""} />
      <SpecActionsLog socket={socket} />
      <OtherPlayerGrid data={otherPlayerData} />
      <div className="played-cards">
        <div className="container-played-cards">
          {currPlayer && cardsToShow?.map(displayPlayedCard)}
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
              isSelected={selectedHandCards.includes(index)}
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
