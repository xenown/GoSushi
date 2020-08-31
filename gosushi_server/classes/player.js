const _ = require('lodash');
const Card = require('./card');

class Player {
  constructor(name, socketId, isAuto = false) {
    this.name = name;
    this.socketId = socketId;
    this.hand = [];
    this.points = 0;
    this.playedCards = [];
    this.turnCards = [];
    this.turnCardsReuse = [];
    this.dessertCards = [];
    this.makiCount = 0;
    this.uramakiCount = 0;
    this.isAuto = isAuto;
    this.hasAutoPlayedCard = false;
  }

  playCardFromHand(card) {
    if (typeof card !== Card) {
      card = new Card(card);
    }
    const index = _.findIndex(this.hand, c => _.isEqual(c, card));
    this.turnCards = this.turnCards.concat(this.hand.splice(index, 1));
  }

  playUsedCard(card) {
    if (typeof card !== Card) {
      card = new Card(card);
    }
    const index = _.findIndex(this.playedCards, c => _.isEqual(c, card));
    this.turnCardsReuse = this.turnCardsReuse.concat(this.playedCards[index]);
  }

  removePlayedCard(card) {
    if (typeof card !== Card) {
      card = new Card(card);
    }
    const index = _.findIndex(this.playedCards, c => _.isEqual(c, card));
    if (index >= 0) {
      this.playedCards.splice(index, 1);
    }
  }

  resetPlayer() {
    this.hand = [];
    this.points = 0;
    this.playedCards = [];
    this.turnCards = [];
    this.turnCardsReuse = [];
    this.dessertCards = [];
    this.makiCount = 0;
    this.uramakiCount = 0;
    this.hasAutoPlayedCard = false;
  }
}

module.exports = Player;
