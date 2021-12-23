import ICard from './ICard'

export default interface IPlayer {
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
