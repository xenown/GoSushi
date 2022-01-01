import Card from '../classes/card';
import { MenuCardNameEnum } from './cardNameEnum';

export default interface ISpecialAction {
    card: Card,
    playerName: string
}

export interface ISpecialLogEntry {
  player: string;
  playedCard: string;
  chosenCard?: string;
  stolenFromPlayer?: string;
  boxCards?: number;
};

export type TSpecialData = MenuCardNameEnum | Card;
