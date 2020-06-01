const _ = require('lodash');
const Card = require('../../classes/card');
const Game = require('../../classes/game');
const { calculateRoundPoints, calculateTurnPoints } = require('../../util/calculatePoints');
const cardNameEnum = require('../../util/cardNameEnum');
const onigiriEnum = require('../../util/onigiriNameEnum');
const menus = require('../../util/suggestedMenus');

const addPlayers = (game, players) => {
  for (let i = 1; i < players.length; i++) {
    game.addPlayer(players[i], players[i]);
  }
}

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
      new Card(cardNameEnum.WASABI),
      new Card(cardNameEnum.WASABI),
      [new Card(cardNameEnum.EGG), new Card(cardNameEnum.SALMON)],
      new Card(cardNameEnum.TOFU),
    ],
    [
      new Card(cardNameEnum.MISO_SOUP),
      new Card(cardNameEnum.URAMAKI, 5),
      new Card(cardNameEnum.URAMAKI, 4),
      new Card(cardNameEnum.URAMAKI, 3),
      new Card(cardNameEnum.URAMAKI, 10),
      new Card(cardNameEnum.TOFU),
      new Card(cardNameEnum.WASABI),
      new Card(cardNameEnum.WASABI),
      new Card(cardNameEnum.SALMON),
      new Card(cardNameEnum.SQUID)
    ],
    [
      new Card(cardNameEnum.TOFU),
      new Card(cardNameEnum.MISO_SOUP),
      new Card(cardNameEnum.URAMAKI, 4),
      new Card(cardNameEnum.URAMAKI, 3),
      new Card(cardNameEnum.URAMAKI, 3),
      new Card(cardNameEnum.URAMAKI, 10),
      new Card(cardNameEnum.WASABI),
      new Card(cardNameEnum.TOFU),
      new Card(cardNameEnum.TOFU),
      new Card(cardNameEnum.SALMON),
    ],
  ];

  const game = new Game(
    _.clone(menus.dinnerForTwo),
    players.length,
    roomCode,
    players[0],
    players[0]
  );

  addPlayers(game, players);
  game.setupDeck();
  game.players.forEach((p, index) => {
    p.hand = hands[index].reverse();
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

  it('should assign two Wasabi\'s in one turn and assign another', () => {
    game.deck.menu.specials = "Wasabi";
    game.players.forEach(p => p.turnCards.push(p.hand.pop()));
    calculateTurnPoints(game.players,
      game.deck.menu,
      game.uramakiCountMap,
      game.uramakiStanding);

    game.players.forEach(p => {
      let card = p.hand.pop();
      if (_.isArray(card)){
        p.turnCards = p.turnCards.concat(card);
      } else {
        p.turnCards.push(card);
      }
    });

    calculateTurnPoints(game.players,
      game.deck.menu,
      game.uramakiCountMap,
      game.uramakiStanding);

    const wasabi1 = game.players[0].playedCards.filter(c => c.name === cardNameEnum.WASABI);
    expect(wasabi1.map(el => el.data)).toEqual([4, 2]);

    const wasabi2 = game.players[1].playedCards.filter(c => c.name === cardNameEnum.WASABI);
    expect(wasabi2.map(el => el.data)).toEqual([4, null]);
  });

  it('should assign two Wasabi\'s in one turn and assign another', () => {
    const wasabi2 = game.players[1].playedCards.filter(c => c.name === cardNameEnum.WASABI);
    expect(wasabi2.map(el => el.data)).toEqual([4, 6]);

    const wasabi3 = game.players[2].playedCards.filter(c => c.name === cardNameEnum.WASABI);
    expect(wasabi3.map(el => el.data)).toEqual([4]);
  });
});

describe('calculateRollPoints', function () {
  const roomCode = "code";
  const players = [
    ["P1", "P2", "P3", "P4", "P5", "P6"],
    ["P1", "P2"],
    ["P1", "P2", "P3"],
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
  ],
  [
    [],
    [],
    [new Card(cardNameEnum.MAKI, 3)],
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

    addPlayers(game, players[num]);

    game.deck.menu.roll = num === 0 ? cardNameEnum.URAMAKI : cardNameEnum.MAKI;
    game.setupDeck();
    game.players.forEach((p, index) => {
      p.playedCards = hands[num][index];
      if (num === 0) p.turnCards.push(uramakis[index]);
    });

    return game;
  }

  const games = [setupGame(0), setupGame(1), setupGame(2)];

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

  it('should give no Maki points if second place has no Maki', () => {
    calculateRoundPoints(games[2].players, games[2].deck.menu);
    expect(games[2].players.map(p => p.points)).toEqual([0, 0, 6]);
  });

  it('should give no Temaki points if all have equal amounts of Temaki', () => {
    games[2].deck.menu.roll = cardNameEnum.TEMAKI;
    calculateRoundPoints(games[2].players, games[2].deck.menu);
    expect(games[2].players.map(p => p.points)).toEqual([0, 0, 6]);
  });
});

describe('calculateAppetizerPoints', function () {
  const roomCode = "code";
  const players = ["P1", "P2", "P3", "P4", "P5", "P6"];

  const hands = [
    [
    ],
    [
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.EEL),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TOFU),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.CIRCLE),
    ],
    [
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.EEL),
      new Card(cardNameEnum.EEL),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TOFU),
      new Card(cardNameEnum.TOFU),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.CIRCLE),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.SQUARE),
    ],
    [
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.EEL),
      new Card(cardNameEnum.EEL),
      new Card(cardNameEnum.EEL),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TOFU),
      new Card(cardNameEnum.TOFU),
      new Card(cardNameEnum.TOFU),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.CIRCLE),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.SQUARE),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.TRIANGLE),
    ],
    [
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.EEL),
      new Card(cardNameEnum.EEL),
      new Card(cardNameEnum.EEL),
      new Card(cardNameEnum.EEL),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.CIRCLE),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.SQUARE),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.TRIANGLE),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.RECTANGLE),
    ],
    [
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.DUMPLING),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.SASHIMI),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.TEMPURA),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.CIRCLE),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.CIRCLE),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.SQUARE),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.SQUARE),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.TRIANGLE),
      new Card(cardNameEnum.ONIGIRI, onigiriEnum.RECTANGLE),
    ],
  ];

  const edamameHands = [[
    [
      new Card(cardNameEnum.EDAMAME),
    ], [], [], [], [], []
  ],
  [
    [
      new Card(cardNameEnum.EDAMAME),
    ],
    [
      new Card(cardNameEnum.EDAMAME),
    ],
    [
      new Card(cardNameEnum.EDAMAME),
    ],
    [
      new Card(cardNameEnum.EDAMAME),
    ],
    [
      new Card(cardNameEnum.EDAMAME),
    ],
    [
      new Card(cardNameEnum.EDAMAME),
      new Card(cardNameEnum.EDAMAME),
    ],
  ],
  [
    [
      new Card(cardNameEnum.EDAMAME),
    ],
    [
      new Card(cardNameEnum.EDAMAME),
      new Card(cardNameEnum.EDAMAME),
      new Card(cardNameEnum.EDAMAME),
    ],
    [
      new Card(cardNameEnum.EDAMAME),
    ],
    [
      new Card(cardNameEnum.EDAMAME),
    ],
    [],
    [],
  ]];

  const game = new Game(
    _.clone(menus.firstMeal),
    players.length,
    roomCode,
    players[0],
    players[0]
  );

  addPlayers(game, players);

  game.players.forEach((p, index) => {
    p.playedCards = hands[index];
  });

  beforeEach(() => {
    game.players.forEach(p => p.points = 0);
  })

  it('should give Dumpling points correctly', () => {
    game.deck.menu.appetizers = ["Dumpling"];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map(p => p.points)).toEqual([0, 1, 3, 6, 10, 15]);
  });

  it('should give Eel points correctly', () => {
    game.deck.menu.appetizers = ["Eel"];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map(p => p.points)).toEqual([0, -3, 7, 7, 7, 0]);
  });

  it('should give Onigiri points correctly', () => {
    game.deck.menu.appetizers = ["Onigiri"];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map(p => p.points)).toEqual([0, 1, 4, 9, 16, 20]);
  });

  it('should give Sashimi points correctly', () => {
    game.deck.menu.appetizers = ["Sashimi"];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map(p => p.points)).toEqual([0, 0, 0, 10, 10, 20]);
  });

  it('should give Tempura points correctly', () => {
    game.deck.menu.appetizers = ["Tempura"];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map(p => p.points)).toEqual([0, 0, 5, 5, 10, 10]);
  });

  it('should give Tofu points correctly', () => {
    game.deck.menu.appetizers = ["Tofu"];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map(p => p.points)).toEqual([0, 2, 6, 0, 0, 0]);
  });

  it('should give 0 points per card when only one player has Edamame', () => {
    game.deck.menu.appetizers = ["Edamame"];
    game.players.forEach((p, index) => {
      p.playedCards = edamameHands[0][index];
    });
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map(p => p.points)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('should give 4 points per card when 6 players have any Edamame', () => {
    game.players.forEach((p, index) => {
      p.playedCards = edamameHands[1][index];
    });
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map(p => p.points)).toEqual([4, 4, 4, 4, 4, 8]);
  });

  it('should give 3 points per card when 4 players have any Edamame', () => {
    game.players.forEach((p, index) => {
      p.playedCards = edamameHands[2][index];
    });
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map(p => p.points)).toEqual([3, 9, 3, 3, 0, 0]);
  });
});

describe('calculateSpecialPoints', function () {
  const roomCode = "code";
  const players = ["P1", "P2", "P3"];

  const hands = [
    [
    ],
    [
      new Card(cardNameEnum.WASABI, 4),
    ],
    [
      new Card(cardNameEnum.WASABI),
    ],
  ];

  const game = new Game(
    _.clone(menus.firstMeal),
    players.length,
    roomCode,
    players[0],
    players[0]
  );

  addPlayers(game, players);

  game.players.forEach((p, index) => {
    p.playedCards = hands[index];
  });

  beforeEach(() => {
    game.players.forEach(p => p.points = 0);
  })

  it('should give Wasabi points correctly', () => {
    game.deck.menu.specials = ["Wasabi"];
    calculateRoundPoints(game.players, game.deck.menu);
    expect(game.players.map(p => p.points)).toEqual([0, 4, 0]);
  });
});
