const _ = require('lodash');
const Card = require('./card');
const cardNameEnum = require('../util/cardNameEnum');
const onigiriNameEnum = require('../util/onigiriNameEnum');

class Deck {
  constructor(menu, numPlayers) {
    this.menu = menu;
    this.playableCards = this.createNigiri()
      .concat(this.createRoll(menu.roll))
      .concat(this.createAppetizer(menu.appetizers[0]))
      .concat(this.createAppetizer(menu.appetizers[1]))
      .concat(this.createAppetizer(menu.appetizers[2]))
      .concat(this.createSpecial(menu.specials[0]))
      .concat(this.createSpecial(menu.specials[1]));
    this.desserts = this.createDesserts(menu.dessert, numPlayers);
    this.activeDeck = _.cloneDeep(this.playableCards);
  }

  shuffle() {
    this.activeDeck = _.shuffle(this.activeDeck);
  }

  createNigiri() {
    let arr = [];
    for (let i = 0; i < 12; i++) {
      if (i < 4) {
        arr[i] = new Card(cardNameEnum.EGG);
      } else if (i > 8) {
        arr[i] = new Card(cardNameEnum.SQUID);
      } else {
        arr[i] = new Card(cardNameEnum.SALMON);
      }
    }
    return arr;
  }

  createRoll(rollName) {
    let arr = [];
    switch (rollName) {
      case cardNameEnum.MAKI:
        for (let i = 0; i < 12; i++) {
          if (i < 4) {
            arr[i] = new Card(cardNameEnum.MAKI, 1);
          } else if (i > 8) {
            arr[i] = new Card(cardNameEnum.MAKI, 3);
          } else {
            arr[i] = new Card(cardNameEnum.MAKI, 2);
          }
        }
        break;
      case cardNameEnum.TEMAKI:
        for (let i = 0; i < 12; i++) {
          arr[i] = new Card(cardNameEnum.TEMAKI);
        }
        break;
      case cardNameEnum.URAMAKI:
        for (let i = 0; i < 12; i++) {
          if (i < 4) {
            arr[i] = new Card(cardNameEnum.URAMAKI, 3);
          } else if (i > 7) {
            arr[i] = new Card(cardNameEnum.URAMAKI, 5);
          } else {
            arr[i] = new Card(cardNameEnum.URAMAKI, 4);
          }
        }
        break;
      default:
        console.log('Invalid roll name.');
    }
    return arr;
  }

  createAppetizer(appetizerName) {
    let arr = [];
    if (appetizerName === cardNameEnum.ONIGIRI) {
      for (let i = 0; i < 8; i++) {
        if (i % 4 === 0) {
          arr[i] = new Card(cardNameEnum.ONIGIRI, onigiriNameEnum.CIRCLE);
        } else if (i % 4 === 1) {
          arr[i] = new Card(cardNameEnum.ONIGIRI, onigiriNameEnum.TRIANGLE);
        } else if (i % 4 === 2) {
          arr[i] = new Card(cardNameEnum.ONIGIRI, onigiriNameEnum.SQUARE);
        } else {
          arr[i] = new Card(cardNameEnum.ONIGIRI, onigiriNameEnum.RECTANGLE);
        }
      }
    } else if (Object.values(cardNameEnum).includes(appetizerName)) {
      for (let i = 0; i < 8; i++) {
        arr[i] = new Card(appetizerName);
      }
    } else {
      console.log('Invalid appetizer name.');
    }
    return arr;
  }

  createSpecial(specialName) {
    let arr = [];
    for (let i = 0; i < 3; i++) {
      if (specialName === cardNameEnum.CHOPSTICKS) {
        arr[i] = new Card(cardNameEnum.CHOPSTICKS, i + 1);
      } else if (specialName === cardNameEnum.SPOON) {
        arr[i] = new Card(cardNameEnum.SPOON, i + 4);
      } else if (specialName === cardNameEnum.MENU) {
        arr[i] = new Card(cardNameEnum.MENU, i + 7);
      } else if (specialName === cardNameEnum.TAKEOUT_BOX) {
        arr[i] = new Card(cardNameEnum.TAKEOUT_BOX, i + 10);
      } else if (Object.values(cardNameEnum).includes(specialName)) {
        arr[i] = new Card(specialName);
      } else {
        console.log('Invalid special name.');
        break;
      }
    }
    return arr;
  }

  createDesserts(dessertName, numPlayers) {
    let arr = [];
    if (dessertName === cardNameEnum.FRUIT) {
      for (let i = 0; i < 15; i++) {
        let fruit = {};
        if (i / 3 < 3) {
          fruit = fruitCombos[Math.floor(i / 3)];
        } else {
          fruit = fruitCombos[Math.floor((i - 9) / 2) + 3];
        }
        arr[i] = new Card(cardNameEnum.FRUIT, fruit);
      }
      if (numPlayers < 6) {
        arr = _.slice(_.shuffle(arr), 5);
      }
    } else if (
      dessertName === cardNameEnum.PUDDING ||
      dessertName === cardNameEnum.GREEN_TEA_ICE_CREAM
    ) {
      const num = numPlayers > 5 ? 15 : 10;
      for (let i = 0; i < num; i++) {
        arr[i] = new Card(dessertName);
      }
    } else {
      console.log('Invalid dessert name.');
    }
    return arr;
  }

  resetDeck(numDesserts) {
    _.remove(this.activeDeck, c => c.name !== this.menu.dessert);
    this.activeDeck = this.activeDeck.concat(this.playableCards);
    this.addDesserts(numDesserts);
  }

  addDesserts(num) {
    this.activeDeck = this.activeDeck.concat(this.desserts.slice(0, num));
    this.desserts = this.desserts.slice(num);
  }

  dealHand(num) {
    const hand = _.take(this.activeDeck, num);
    this.activeDeck = _.drop(this.activeDeck, num);
    return hand;
  }
}

module.exports = Deck;

const fruitCombos = [
  {
    watermelon: 1,
    pineapple: 1,
    orange: 0,
  },
  {
    watermelon: 1,
    pineapple: 0,
    orange: 1,
  },
  {
    watermelon: 0,
    pineapple: 1,
    orange: 1,
  },
  {
    watermelon: 2,
    pineapple: 0,
    orange: 0,
  },
  {
    watermelon: 0,
    pineapple: 2,
    orange: 0,
  },
  {
    watermelon: 0,
    pineapple: 0,
    orange: 2,
  },
];
