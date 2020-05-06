const Deck = require('./deck');
const Card = require('./card');

class Game {
  constructor(menu, playerNum, roomCode, hostPlayer) {
    this.deck = new Deck(menu, playerNum);
    this.numPlayers = playerNum;
    this.roomCode = roomCode;
    this.playerNames = [hostPlayer];
    this.hostPlayer = hostPlayer;
  }
}

module.exports = Game;
