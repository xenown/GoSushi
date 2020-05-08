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
    const index = _.find(hand, card);
    this.turnCards.push(_.remove(hand, (ele, i) => i === index));
  }
}

module.exports = Player;
