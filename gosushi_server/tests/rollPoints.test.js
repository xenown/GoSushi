const _ = require('lodash');
const Card = require('../classes/card');
const Game = require('../classes/game');
const { calculateRoundPoints } = require('../util/calculatePoints');
const cardNameEnum = require('../util/cardNameEnum');
const menus = require('../util/suggestedMenus');

const overFivePlayers = () => {
  const roomCode = "code";
  const players = ["P1", "P2", "P3", "P4", "P5", "P6"];
  const hands = [
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
  ];

  const uramakis = [
    new Card(cardNameEnum.URAMAKI, 5),
    new Card(cardNameEnum.URAMAKI, 4),
    new Card(cardNameEnum.URAMAKI, 5),
    new Card(cardNameEnum.URAMAKI, 3),
    new Card(cardNameEnum.URAMAKI, 1),
    new Card(cardNameEnum.URAMAKI, 1),
  ]

  const game = new Game(
    _.clone(menus.firstMeal),
    players.length,
    roomCode,
    players[0],
    players[0]
  );

  const uramakiCountMap = {};
  const uramakiStanding = { value: 1 };

  uramakiCountMap[players[0]] = 0;

  for (let i = 1; i < players.length; i++) {
    game.addPlayer(players[i], players[i]);
    uramakiCountMap[players[i]] = 0;
  }

  game.setupDeck();
  game.players.forEach((p, index) => {
    p.playedCards = hands[index];
    p.hand.push(new Card(cardNameEnum.DUMPLING));
    p.turnCards.push(uramakis[index]);
  });


  calculateRoundPoints(game.players, game.deck.menu);
  console.log('calculateRoundPoints should give Maki points correctly for over 5 players');
  console.log(_.isEqual(game.players.map(p => p.points), [4, 4, 2, 0, 0, 0]));

  game.deck.menu.roll = cardNameEnum.TEMAKI;
  calculateRoundPoints(game.players, game.deck.menu);
  console.log('calculateRoundPoints should give Temaki points correctly for over 5 players');
  console.log(_.isEqual(game.players.map(p => p.points), [4, 0, 6, 4, -4, -4]));

  game.deck.menu.roll = cardNameEnum.URAMAKI;
  calculateTurnPoints(game.players, game.deck.menu, uramakiCountMap, uramakiStanding);
  console.log('calculateTurnPoints should give Uramaki points correctly at the end of last turn');
  console.log(_.isEqual(game.players.map(p => p.points), [12, 2, 14, 4, -4, -4]));
};

const onlyTwoPlayers = () => {
  const roomCode = "code";
  const players = ["P1", "P2"];
  const hands = [
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
  ];

  const game = new Game(
    _.clone(menus.firstMeal),
    players.length,
    roomCode,
    players[0],
    players[0]
  );

  for (let i = 1; i < players.length; i++) {
    game.addPlayer(players[i], players[i]);
  }

  game.setupDeck();
  game.players.forEach((p, index) => {
    p.playedCards = hands[index];
  });

  calculateRoundPoints(game.players, game.deck.menu);
  console.log('calculateRoundPoints should give Maki points correctly for less than 5 players');
  console.log(_.isEqual(game.players.map(p => p.points), [6, 3]));

  game.deck.menu.roll = cardNameEnum.TEMAKI;
  calculateRoundPoints(game.players, game.deck.menu);
  console.log('calculateRoundPoints should give Temaki points correctly for only 2 players');
  console.log(_.isEqual(game.players.map(p => p.points), [6, 7]));
}

overFivePlayers();
onlyTwoPlayers();