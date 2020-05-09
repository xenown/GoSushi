const _ = require('lodash');

class Player {
  constructor(name, socketId) {
    this.name = name;
    this.socketId = socketId;
    this.hand = [];
    this.points = 0;
    this.playedCards = [];
    this.turnCards = [];
    this.makiCount = 0;
    this.uramakiCount = 0;
  }

  playCard(card) {
    const index = _.findIndex(this.hand, c => _.isEqual(c, card));
    this.turnCards = this.turnCards.concat(this.hand.splice(index, 1));
  }
}

module.exports = Player;
