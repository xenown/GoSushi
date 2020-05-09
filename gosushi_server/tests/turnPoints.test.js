const _ = require('lodash');
const Card = require('../classes/card');
const Game = require('../classes/game');
const { calculateTurnPoints } = require('../util/calculatePoints');
const cardNameEnum = require('../util/cardNameEnum');
const menus = require('../util/suggestedMenus');

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

game.addPlayer(players[1], players[1]);
game.addPlayer(players[2], players[2]);

game.setupDeck();
game.players.forEach((p, index) => {
  p.hand = hands[index].reverse();
  p.turnCards.push(p.hand.pop());
});

calculateTurnPoints(game.players,
  game.deck.menu,
  game.uramakiCountMap,
  game.uramakiStanding);
var misos = game.players.map(p => _.last(p.playedCards));
console.log('calculateTurnPoints should not give Miso points when 2 are played');
console.log(_.isEqual(misos.map(el => el.data), [0, 0, null]));

game.players.forEach(p => p.turnCards.push(p.hand.pop()));
calculateTurnPoints(game.players,
  game.deck.menu,
  game.uramakiCountMap,
  game.uramakiStanding);
misos = game.players.map(p => _.last(p.playedCards));
console.log('calculateTurnPoints should give Miso 3 points when 1 is played');
console.log(_.isEqual(misos.map(el => el.data), [5, 5, 3]));

game.players.forEach(p => p.turnCards.push(p.hand.pop()));
calculateTurnPoints(game.players,
  game.deck.menu,
  game.uramakiCountMap,
  game.uramakiStanding);
console.log('calculateTurnPoints should not give points when no Uramaki race is won');
console.log(_.isEqual(game.players.map(p => p.points), [0, 0, 0]));

game.players.forEach(p => p.turnCards.push(p.hand.pop()));
calculateTurnPoints(game.players,
  game.deck.menu,
  game.uramakiCountMap,
  game.uramakiStanding);
console.log('calculateTurnPoints should give 8 points to tied 1st place winners');
console.log(_.isEqual(game.players.map(p => p.points), [8, 8, 0]));

game.players.forEach(p => p.turnCards.push(p.hand.pop()));
calculateTurnPoints(game.players,
  game.deck.menu,
  game.uramakiCountMap,
  game.uramakiStanding);
console.log('calculateTurnPoints should give 2 points to tied 3rd place winners');
console.log(_.isEqual(game.players.map(p => p.points), [10, 10, 2]));

game.players.forEach(p => p.turnCards.push(p.hand.pop()));
calculateTurnPoints(game.players,
  game.deck.menu,
  game.uramakiCountMap,
  game.uramakiStanding);
console.log('calculateTurnPoints should give no points when all prizes are taken');
console.log(_.isEqual(game.players.map(p => p.points), [10, 10, 2]));