import Card from '../classes/card'

export interface ISimplePlayer {
  name: string;
  socketId: string;
}

export default interface IPlayer {
  name: string;
  ip: string;
  socketId: string;
  points: number;
  playedCards: Card[];
  turnCards: Card[];
  turnCardsReuse: Card[];
  dessertCards: Card[];
  isAuto: boolean
  hasAutoPlayedCard: boolean;
  isFinished: boolean;
}