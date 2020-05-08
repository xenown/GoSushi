const OnigiriEnum = Object.freeze({
  CIRCLE: 0,
  TRIANGLE: 1,
  SQUARE: 2,
  RECTANGLE: 3,
});

class Card {
  constructor(cardName, data = null) {
    this.isFlipped = false;
    this.cardName = cardName;
    this.data = data;
  }

  print() {
    console.log(this.cardName);
    if (!data) {
      console.log(`data: ${this.data}`);
    }
  }
}

module.exports = Card;
module.exports.OnigiriEnum = OnigiriEnum;
