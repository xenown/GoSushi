import ICard from './ICard'
import { MenuCardNameEnum } from './cardNameEnum';

export interface ISimplePlayer {
  name: string;
  socketId: string;
}

export type IPlayerResult = {
  [cardName in MenuCardNameEnum]?: number;
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
  isHost: boolean;
}
