const _ = require('lodash');
const Card = require('../../classes/card');
const Game = require('../../classes/game');
const { calculateRoundPoints, calculateTurnPoints } = require('../../util/calculatePoints');
const cardNameEnum = require('../../util/cardNameEnum');
const menus = require('../../util/suggestedMenus');

describe('calculateTurnPoints', function () {
  const roomCode = "code";
  const players = ["P1", "P2", "P3"];
  const hands = [
    [
      new Card(cardNameEnum.MISO_SOUP),
      new Card(cardNameEnum.URAMAKI, 5),
      new Card(cardNameEnum.URAMAKI, 4),
      new Card(cardNameEnum.URAMAKI, 3),
      new Card(cardNameEnum.URAMAKI, 10),
      new Card(cardNameEnum.TOFU),
    ],
    [
      new Card(cardNameEnum.MISO_SOUP),
      new Card(cardNameEnum.URAMAKI, 5),
      new Card(cardNameEnum.URAMAKI, 4),
      new Card(cardNameEnum.URAMAKI, 3),
      new Card(cardNameEnum.URAMAKI, 10),
      new Card(cardNameEnum.TOFU),
    ],
    [
      new Card(cardNameEnum.TOFU),
      new Card(cardNameEnum.MISO_SOUP),
      new Card(cardNameEnum.URAMAKI, 4),
      new Card(cardNameEnum.URAMAKI, 3),
      new Card(cardNameEnum.URAMAKI, 3),
      new Card(cardNameEnum.URAMAKI, 10),
    ],
  ];

  const game = new Game(
    menus.dinnerForTwo,
    players.length,
    roomCode,
    players[0],
    players[0]
  );

  beforeAll(() => {
    game.addPlayer(players[1], players[1]);
    game.addPlayer(players[2], players[2]);

    game.setupDeck();
    game.players.forEach((p, index) => {
      p.hand = hands[index].reverse();
    });
  });

  beforeEach(() => {
    game.players.forEach(p => p.turnCards.push(p.hand.pop()));
    calculateTurnPoints(game.players,
      game.deck.menu,
      game.uramakiCountMap,
      game.uramakiStanding);
  });

  it('should not give Miso points when 2 are played', () => {
    const misos = game.players.map(p => _.last(p.playedCards));
    expect(misos.map(el => el.data)).toEqual([0, 0, null]);
  });

  it('should give Miso 3 points when 1 is played', () => {
    const misos = game.players.map(p => _.last(p.playedCards));
    expect(misos.map(el => el.data)).toEqual([5, 5, 3]);
  });

  it('should not give points when no Uramaki race is won', () => {
    expect(game.players.map(p => p.points)).toEqual([0, 0, 0]);
  });

  it('should give 8 points to tied 1st place winners', () => {
    expect(game.players.map(p => p.points)).toEqual([8, 8, 0]);
  });

  it('should give 2 points to tied 3rd place winners', () => {
    expect(game.players.map(p => p.points)).toEqual([10, 10, 2]);
  });

  it('should give no points when all prizes are taken', () => {
    expect(game.players.map(p => p.points)).toEqual([10, 10, 2]);
  });
});

describe('calculateRollPoints', function () {
  const roomCode = "code";
  const players = [
    ["P1", "P2", "P3", "P4", "P5", "P6"],
    ["P1", "P2"],
  ];

  const hands = [[
    [
      new Card(cardNameEnum.MAKI, 10),
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
    ],
    [
      new Card(cardNameEnum.MAKI, 10),
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
    ],
    [
      new Card(cardNameEnum.MAKI, 6),
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
    ],
    [
      new Card(cardNameEnum.MAKI, 3),
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
    ],
    [
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
    ],
    [
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
    ],
  ],
  [
    [
      new Card(cardNameEnum.MAKI, 10),
      new Card(cardNameEnum.TEMAKI),
    ],
    [
      new Card(cardNameEnum.MAKI, 5),
      new Card(cardNameEnum.MAKI, 3),
      new Card(cardNameEnum.TEMAKI),
      new Card(cardNameEnum.TEMAKI),
    ],
  ]
  ];

  const uramakis = [
    new Card(cardNameEnum.URAMAKI, 5),
    new Card(cardNameEnum.URAMAKI, 4),
    new Card(cardNameEnum.URAMAKI, 5),
    new Card(cardNameEnum.URAMAKI, 3),
    new Card(cardNameEnum.URAMAKI, 1),
    new Card(cardNameEnum.URAMAKI, 1),
  ]

  const setupGame = num => {
    const game = new Game(
      _.clone(menus.firstMeal),
      players[num].length,
      roomCode,
      players[num][0],
      players[num][0]
    );

    for (let i = 1; i < players[num].length; i++) {
      game.addPlayer(players[num][i], players[num][i]);
    }

    game.deck.menu.roll = num === 0 ? cardNameEnum.URAMAKI : cardNameEnum.MAKI;
    game.setupDeck();
    game.players.forEach((p, index) => {
      p.playedCards = hands[num][index];
      if (num === 0) p.turnCards.push(uramakis[index]);
    });

    return game;
  }

  const games = [setupGame(0), setupGame(1)];

  it('should give Uramaki points correctly at the end of last turn', () => {
    calculateTurnPoints(games[0].players, games[0].deck.menu, games[0].uramakiCountMap, games[0].uramakiStanding);
    expect(games[0].players.map(p => p.points)).toEqual([8, 2, 8, 0, 0, 0]);
  });

  it('should give Maki points correctly for over 5 players', () => {
    games[0].deck.menu.roll = cardNameEnum.MAKI;
    calculateRoundPoints(games[0].players, games[0].deck.menu);
    expect(games[0].players.map(p => p.points)).toEqual([12, 6, 10, 0, 0, 0]);
  });

  it('should give Temaki points correctly for over 5 players', () => {
    games[0].deck.menu.roll = cardNameEnum.TEMAKI;
    calculateRoundPoints(games[0].players, games[0].deck.menu);
    expect(games[0].players.map(p => p.points)).toEqual([12, 2, 14, 4, -4, -4]);
  });

  it('should give Maki points correctly for less than 5 players', () => {
    calculateRoundPoints(games[1].players, games[1].deck.menu);
    expect(games[1].players.map(p => p.points)).toEqual([6, 3]);
  });

  it('should give Temaki points correctly for only 2 players', () => {
    games[1].deck.menu.roll = cardNameEnum.TEMAKI;
    calculateRoundPoints(games[1].players, games[1].deck.menu);
    expect(games[1].players.map(p => p.points)).toEqual([6, 7]);
  });
});