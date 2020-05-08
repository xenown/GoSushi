const Card = require('./card');
const CardNameEnum = require('../util/cardNameEnum');
const _ = require('lodash');

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
    console.log('shuffled deck');
  }

  createNigiri() {
    let arr = [];
    for (let i = 0; i < 12; i++) {
      if (i < 4) {
        arr[i] = new Card(CardNameEnum.EGG);
      } else if (i > 8) {
        arr[i] = new Card(CardNameEnum.SQUID);
      } else {
        arr[i] = new Card(CardNameEnum.SALMON);
      }
    }
    return arr;
  }

  createRoll(rollName) {
    let arr = [];
    switch (rollName) {
      case CardNameEnum.MAKI:
        for (let i = 0; i < 12; i++) {
          if (i < 4) {
            arr[i] = new Card(CardNameEnum.MAKI, 1);
          } else if (i > 8) {
            arr[i] = new Card(CardNameEnum.MAKI, 3);
          } else {
            arr[i] = new Card(CardNameEnum.MAKI, 2);
          }
        }
        break;
      case CardNameEnum.TEMAKI:
        for (let i = 0; i < 12; i++) {
          arr[i] = new Card(CardNameEnum.TEMAKI);
        }
        break;
      case CardNameEnum.URAMAKI:
        for (let i = 0; i < 12; i++) {
          if (i < 4) {
            arr[i] = new Card(CardNameEnum.URAMAKI, 3);
          } else if (i > 7) {
            arr[i] = new Card(CardNameEnum.URAMAKI, 5);
          } else {
            arr[i] = new Card(CardNameEnum.URAMAKI, 4);
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
    if (appetizerName === CardNameEnum.ONIGIRI) {
      for (let i = 0; i < 8; i++) {
        if (i % 4 === 0) {
          arr[i] = new Card(CardNameEnum.ONIGIRI, Card.OnigiriEnum.CIRCLE);
        } else if (i % 4 === 1) {
          arr[i] = new Card(CardNameEnum.ONIGIRI, Card.OnigiriEnum.TRIANGLE);
        } else if (i % 4 === 2) {
          arr[i] = new Card(CardNameEnum.ONIGIRI, Card.OnigiriEnum.SQUARE);
        } else {
          arr[i] = new Card(CardNameEnum.ONIGIRI, Card.OnigiriEnum.RECTANGLE);
        }
      }
    } else if (Object.values(CardNameEnum).includes(appetizerName)) {
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
      if (specialName === CardNameEnum.CHOPSTICKS) {
        arr[i] = new Card(CardNameEnum.CHOPSTICKS, i + 1);
      } else if (specialName === CardNameEnum.SPOON) {
        arr[i] = new Card(CardNameEnum.SPOON, i + 4);
      } else if (specialName === CardNameEnum.MENU) {
        arr[i] = new Card(CardNameEnum.MENU, i + 7);
      } else if (specialName === CardNameEnum.TAKEOUT_BOX) {
        arr[i] = new Card(CardNameEnum.TAKEOUT_BOX, i + 10);
      } else if (Object.values(CardNameEnum).includes(specialName)) {
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
    if (dessertName === CardNameEnum.FRUIT) {
      for (let i = 0; i < 15; i++) {
        let fruit = {};
        if (i / 3 < 3) {
          fruit = fruitCombos[i / 3];
        } else {
          fruit = fruitCombos[(i - 9) / 2 + 3];
        }
        arr[i] = new Card(CardNameEnum.FRUIT, fruit);
      }
      if (numPlayers < 6) {
        arr = _.slice(_.shuffle(arr), 5);
      }
    } else if (
      dessertName === CardNameEnum.PUDDING ||
      dessertName === CardNameEnum.GREEN_TEA_ICE_CREAM
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
    console.log(this.activeDeck);
    _.remove(this.activeDeck, c => c.cardName !== this.menu.dessert);
    console.log(this.activeDeck);
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
