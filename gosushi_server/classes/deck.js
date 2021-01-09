const _ = require('lodash');
const Card = require('./card');
const cardNameEnum = require('../util/cardNameEnum');
const fruitCombos = require('../util/fruitCombos');
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
        arr[i] = new Card(cardNameEnum.EGG, i);
      } else if (i > 8) {
        arr[i] = new Card(cardNameEnum.SQUID, i);
      } else {
        arr[i] = new Card(cardNameEnum.SALMON, i);
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
            arr[i] = new Card(cardNameEnum.MAKI, i, 1);
          } else if (i > 8) {
            arr[i] = new Card(cardNameEnum.MAKI, i, 3);
          } else {
            arr[i] = new Card(cardNameEnum.MAKI, i, 2);
          }
        }
        break;
      case cardNameEnum.TEMAKI:
        for (let i = 0; i < 12; i++) {
          arr[i] = new Card(cardNameEnum.TEMAKI, i);
        }
        break;
      case cardNameEnum.URAMAKI:
        for (let i = 0; i < 12; i++) {
          if (i < 4) {
            arr[i] = new Card(cardNameEnum.URAMAKI, i, 3);
          } else if (i > 7) {
            arr[i] = new Card(cardNameEnum.URAMAKI, i, 5);
          } else {
            arr[i] = new Card(cardNameEnum.URAMAKI, i, 4);
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
          arr[i] = new Card(cardNameEnum.ONIGIRI, i, onigiriNameEnum.CIRCLE);
        } else if (i % 4 === 1) {
          arr[i] = new Card(cardNameEnum.ONIGIRI, i, onigiriNameEnum.TRIANGLE);
        } else if (i % 4 === 2) {
          arr[i] = new Card(cardNameEnum.ONIGIRI, i, onigiriNameEnum.SQUARE);
        } else {
          arr[i] = new Card(cardNameEnum.ONIGIRI, i, onigiriNameEnum.RECTANGLE);
        }
      }
    } else if (Object.values(cardNameEnum).includes(appetizerName)) {
      for (let i = 0; i < 8; i++) {
        arr[i] = new Card(appetizerName, i);
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
        arr[i] = new Card(cardNameEnum.CHOPSTICKS, i, i + 1);
      } else if (specialName === cardNameEnum.SPOON) {
        arr[i] = new Card(cardNameEnum.SPOON, i, i + 4);
      } else if (specialName === cardNameEnum.MENU) {
        arr[i] = new Card(cardNameEnum.MENU, i, i + 7);
      } else if (specialName === cardNameEnum.TAKEOUT_BOX) {
        arr[i] = new Card(cardNameEnum.TAKEOUT_BOX, i, i + 10);
      } else if (Object.values(cardNameEnum).includes(specialName)) {
        arr[i] = new Card(specialName, i);
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
        arr[i] = new Card(cardNameEnum.FRUIT, i, fruit);
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
        arr[i] = new Card(dessertName, i);
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

  removeOneAndShuffle(card) {
    let chosenCard = new Card(card);
    let index = _.findIndex(this.activeDeck, c => _.isEqual(c, chosenCard));
    if (index > 4) {
      console.log(
        `Chose item at index ${index}, should not have been able to choose from beyond the first 4 cards!`
      );
    }
    let removed = this.activeDeck.splice(index, 1)[0];
    this.shuffle();
    return removed;
  }
}

module.exports = Deck;

