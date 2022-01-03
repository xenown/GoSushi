import { IMoreLessPoints, IPointsMap } from '../types/IPoints';

const makiPointsMap: IMoreLessPoints = {
  less: {
    1: 6,
    2: 3,
  },
  more: {
    1: 4,
    2: 2,
  },
};

const uramakiPointsMap: IPointsMap = {
  1: 8,
  2: 5,
  3: 2,
};

const dumplingPointsMap: IPointsMap = {
  0: 0,
  1: 1,
  2: 3,
  3: 6,
  4: 10,
  5: 15,
};

const fruitPointsMap: IPointsMap = {
  0: -2,
  1: 0,
  2: 1,
  3: 3,
  4: 6,
  5: 10,
};

export {
  makiPointsMap,
  uramakiPointsMap,
  dumplingPointsMap,
  fruitPointsMap,
};