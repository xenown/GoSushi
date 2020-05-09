const _ = require('lodash');
const CardNameEnum = require('../util/cardNameEnum');
const Player = require('./player');
const Deck = require('./deck');
const handSize = require('../util/handSize');
const {
  calculateTurnPoints,
  calculateRoundPoints,
} = require('../util/calculatePoints');

class Game {
  constructor(menu, playerNum, roomCode, hostPlayer, socketId) {
    this.deck = new Deck(menu, playerNum);
    this.numPlayers = playerNum;
    this.roomCode = roomCode;
    this.hostPlayer = new Player(hostPlayer, socketId);
    this.players = [this.hostPlayer];
    this.round = 1;
    this.hands = [];
    this.playedTurn = 0;
    this.uramakiCountMap = {};
    this.uramakiStanding = { value: 1 };
  }

  addPlayer(name, socketId) {
    this.players.push(new Player(name, socketId));
  }

  finishedTurn(sendHands, sendPoints) {
    this.playedTurn++;
    if (this.playedTurn === this.numPlayers) {
      this.playedTurn = 0;
      calculateTurnPoints(
        this.players,
        this.deck.menu,
        this.uramakiCountMap,
        this.uramakiStanding,
      );
      this.rotateHands(this.players.map(p => p.hand));
      if (this.players[0].hand.length === 0) {
        // no more cards in the hand
        if (this.round < 3) {
          // go to next round
          this.round++;
          // this.calculateRoundPoints()
          // remove and add desserts
          console.log('End of round');
          this.startRound();
          this.players.forEach(sendHands);
          this.players.forEach(sendPoints); // may be changed later! Don't mere with above forEach just yet
        } else {
          // end game + display results
          console.log('End of game');
        }
      } else {
        this.players.forEach(sendHands);
        // for each player, emit the 'dealHand' event -> will send each player their hand
      }
    }
  }

  startRound() {
    this.setupDeck();

    const hands = [];
    for (let i = 0; i < this.numPlayers; i++) {
      const temp = this.deck.dealHand(handSize[this.numPlayers]);
      hands.push(temp);
    }
    this.rotateHands(hands);
  }

  setupDeck() {
    const dessertsMap =
      this.numPlayers > 6 ? numDesserts.more : numDesserts.less;
    this.deck.resetDeck(dessertsMap[this.round]);
    this.deck.shuffle();

    if (this.deck.menu.roll === CardNameEnum.URAMAKI) {
      this.players.forEach(p => (this.uramakiCountMap[p.name] = 0));
    }
  }

  getPlayerHands() {
    return this.players.map(p => p.hand);
  }

  rotateHands(hands) {
    const firstHand = hands.shift();
    hands.push(firstHand);
    this.players.forEach((p, idx) => (p.hand = hands[idx]));
  }

  sumCardData(name, player) {
    return player.playedCards.reduce(
      (accum, curr) => (accum += curr.name === name ? curr.data : 0)
    );
  }

  calculateEndPoints() {
    // Desserts
  }
}

module.exports = Game;

const numDesserts = {
  less: {
    1: 5,
    2: 3,
    3: 2,
  },
  more: {
    1: 7,
    2: 5,
    3: 3,
  },
};
