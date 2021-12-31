import Card from '../classes/card';

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

export type TSpecialData = string | Card;
