export interface ICountMap {
  [key: string]: number,
}

export interface IPointsMap {
  [key: number]: number,
}

export interface IUramakiStanding {
  value: number,
}

export interface IMoreLessPoints {
  less: {
    [key: number]: number
  },
  more: {
    [key: number]: number
  }
}
