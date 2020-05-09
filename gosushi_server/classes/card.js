const OnigiriEnum = Object.freeze({
  CIRCLE: 0,
  TRIANGLE: 1,
  SQUARE: 2,
  RECTANGLE: 3,
});

class Card {
  constructor(card, data = null) {
    if (typeof (card) === 'string') {
      this.isFlipped = false;
      this.cardName = card;
      this.data = data;
    } else if (typeof (card) === 'object') {
      // copy constructor
      Object.assign(this, card)
    }
  }

  print() {
    console.log(this.card);
    if (!data) {
      console.log(`data: ${this.data}`);
    }
  }
}

module.exports = Card;
module.exports.OnigiriEnum = OnigiriEnum;
