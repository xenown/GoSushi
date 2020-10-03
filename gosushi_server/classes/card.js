class Card {
  constructor(card, id, data = null) {
    if (typeof card === 'string') {
      this.isFlipped = false;
      this.name = card;
      this.data = data;
      this.id = id;
    } else if (typeof card === 'object') {
      // copy constructor
      Object.assign(this, card);
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
