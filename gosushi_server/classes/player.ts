import { findIndex, isEqual } from 'lodash';
import CardNameEnum from '../types/cardNameEnum';
import Card from './card';

class Player {
  name: string;
  ip: string;
  socketId: string;
  hand: Card[];
  points: number;
  playedCards: Card[];
  turnCards: Card[];
  turnCardsReuse: Card[];
  dessertCards: Card[];
  makiCount: number;
  uramakiCount: number;
  isAuto: boolean
  hasAutoPlayedCard: boolean;

  constructor(name: string, ip: string, socketId: string, isAuto: boolean = false) {
    this.name = name;
    this.ip = ip;
    this.socketId = socketId;
    this.hand = [];
    this.points = 0;
    this.playedCards = [];
    this.turnCards = [];
    this.turnCardsReuse = [];
    this.dessertCards = [];
    this.makiCount = 0;
    this.uramakiCount = 0;
    this.isAuto = isAuto;
    this.hasAutoPlayedCard = false;
  } // constructor

  private castCard(card: Card | CardNameEnum): Card {
    if (!(card instanceof Card)) {
      return new Card(card); 
    }
    return card;
  } // castCard

  private getIndexFromList(list: Card[], targetCard: Card) {
    return findIndex(list, (c: Card) => isEqual(c, targetCard));
  } // getIndexFromList

  // find the chosen card in the hand and add it to the turnCards array
  playCardFromHand(card: Card) {
    card = this.castCard(card);
    const index = this.getIndexFromList(this.hand, card);
    this.turnCards = this.turnCards.concat(this.hand[index]);
  } // playCardFromHand

  // find the chosen card and remove from the hand
  removeCardFromHand(card: Card | CardNameEnum) {
    card = this.castCard(card);
    const index = this.getIndexFromList(this.hand, card);
    if (index >= 0) {
      this.hand.splice(index, 1)
    }
  } // removeCardFromHand

  // find and move a played card to be reused???
  playUsedCard(card: Card | CardNameEnum) {
    card = this.castCard(card);
    const index = this.getIndexFromList(this.playedCards, card);
    this.turnCardsReuse = this.turnCardsReuse.concat(this.playedCards[index]);
  } // playUsedCard

  // find and remove a played card
  removePlayedCard(card: Card | CardNameEnum) {
    card = this.castCard(card);
    const index = this.getIndexFromList(this.playedCards, card);
    if (index >= 0) {
      this.playedCards.splice(index, 1);
    }
  } // removePlayedCard

  // reset player for a new game
  resetPlayer() {
    this.hand = [];
    this.points = 0;
    this.playedCards = [];
    this.turnCards = [];
    this.turnCardsReuse = [];
    this.dessertCards = [];
    this.makiCount = 0;
    this.uramakiCount = 0;
    this.hasAutoPlayedCard = false;
  } // resetPlayer
} // Player

export default Player;
