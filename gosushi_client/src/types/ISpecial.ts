import { MenuCardNameEnum } from '../types/cardNameEnum';
import ICard from '../types/ICard';

export interface ISpecialLogEntry {
  player: string;
  playedCard: string;
  chosenCard?: string;
  stolenFromPlayer?: string;
  boxCards?: number;
};

export type TSpecialData = MenuCardNameEnum | ICard;
