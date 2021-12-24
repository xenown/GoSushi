import ICard from './ICard'

export interface ISimplePlayer {
  name: string;
  socketId: string;
}

export default interface IPlayer extends ISimplePlayer {
  name: string;
  ip: string;
  socketId: string;
  points: number;
  playedCards: ICard[];
  turnCards: ICard[];
  turnCardsReuse: ICard[];
  dessertCards: ICard[];
  isAuto: boolean
  hasAutoPlayedCard: boolean;
  isFinished: boolean;
}
