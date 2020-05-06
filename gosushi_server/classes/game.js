const Deck = require('./deck');

class Game {
  constructor(menu, playerNum, roomCode, hostPlayer) {
    this.deck = new Deck(menu, playerNum);
    this.numPlayers = playerNum;
    this.roomCode = roomCode;
    this.playerNames = [hostPlayer];
    this.hostPlayer = hostPlayer;
    this.round = 1;
    this.hands = [];
    this.pointMap = {};

    this.addPoints(hostPlayer, 0);
  }

  addPoints(playerName, points) {
    if (!this.pointMap[player]) {
      this.pointMap[player] = 0;
      return;
    }
    this.pointMap[playerName] += points;
  }

  handleRoundStart() {
    const map = this.numPlayers > 6 ? numDesserts.more : numDesserts.less;
    this.deck.resetDeck(map[this.round]);

    for (let i = 0; i < this.numPlayers; i++) {
      this.hands.push(this.deck.dealHand());
    }
  }
}

module.exports = Game;

const numDesserts = {
  less: {
    1: 5,
    2: 3,
    3: 2
  },
  more: {
    1: 7,
    2: 5,
    3: 3
  }
};