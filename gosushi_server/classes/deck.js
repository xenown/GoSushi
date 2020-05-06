const Card = require('./card');

class Deck {
  constructor(menu, playerNum) {
    this.menu = menu;
    this.cards = this.createNigiri()
      .concat(this.createRoll(menu.roll))
      .concat(this.createAppetizer(menu.appetizer[0]))
      .concat(this.createAppetizer(menu.appetizer[1]))
      .concat(this.createSpecial(menu.special[0]))
      .concat(this.createSpecial(menu.special[1]));
    this.dessert = this.createDesserts(menu.dessert, playerNum);
  }

  shuffle() {
    console.log("shuffled deck");
  }

  createNigiri() {
    let arr = [];
    for (let i = 0; i < 12; i++) {
      if (i < 4) {
        arr[i] = new Card(Card.CardNameEnum.EGG);
      } else if (i > 8) {
        arr[i] = new Card(Card.CardNameEnum.SQUID);
      } else {
        arr[i] = new Card(Card.CardNameEnum.SALMON);
      }
    }
    return arr;
  }

  createRoll(rollName) {
    let arr = [];
    switch (rollName) {
      case Card.CardNameEnum.MAKI:
        for (let i = 0; i < 12; i++) {
          if (i < 4) {
            arr[i] = new Card(Card.CardNameEnum.MAKI, 1);
          } else if (i > 8) {
            arr[i] = new Card(Card.CardNameEnum.MAKI, 3);
          } else {
            arr[i] = new Card(Card.CardNameEnum.MAKI, 2);
          }
        }
        break;
      case Card.CardNameEnum.TEMAKI:
        for (let i = 0; i < 12; i++) {
          arr[i] = new Card(Card.CardNameEnum.TEMAKI);
        }
        break;
      case Card.CardNameEnum.URAMAKI:
        for (let i = 0; i < 12; i++) {
          if (i < 4) {
            arr[i] = new Card(Card.CardNameEnum.URAMAKI, 3);
          } else if (i > 7) {
            arr[i] = new Card(Card.CardNameEnum.URAMAKI, 5);
          } else {
            arr[i] = new Card(Card.CardNameEnum.URAMAKI, 4);
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
    if (appetizerName === Card.CardNameEnum.ONIGIRI) {
      for (let i = 0; i < 8; i++) {
        if (i % 4 === 0) {
          arr[i] = new Card(Card.CardNameEnum.ONIGIRI, Card.OnigiriEnum.CIRCLE);
        } else if (i % 4 === 1) {
          arr[i] = new Card(Card.CardNameEnum.ONIGIRI, Card.OnigiriEnum.TRIANGLE);
        } else if (i % 4 === 2) {
          arr[i] = new Card(Card.CardNameEnum.ONIGIRI, Card.OnigiriEnum.SQUARE);
        } else {
          arr[i] = new Card(Card.CardNameEnum.ONIGIRI, Card.OnigiriEnum.RECTANGLE);
        }
      }
    } else if (Object.values(Card.CardNameEnum).includes(appetizerName)) {
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
      if (specialName === Card.CardNameEnum.CHOPSTICKS) {
        arr[i] = new Card(Card.CardNameEnum.CHOPSTICKS, i + 1);
      } else if (specialName === Card.CardNameEnum.SPOON) {
        arr[i] = new Card(Card.CardNameEnum.SPOON, i + 4);
      } else if (specialName === Card.CardNameEnum.MENU) {
        arr[i] = new Card(Card.CardNameEnum.MENU, i + 7);
      } else if (specialName === Card.CardNameEnum.TAKEOUT_BOX) {
        arr[i] = new Card(Card.CardNameEnum.TAKEOUT_BOX, i + 10);
      } else if (Object.values(Card.CardNameEnum).includes(specialName)) {
        arr[i] = new Card(specialName);
      } else {
        console.log('Invalid special name.');
        break;
      }
    }
    return arr;
  }

  createDesserts(dessertName, playerNum) {
    const num = playerNum > 5 ? 15 : 10;
    let arr = [];
    if (dessertName === Card.CardNameEnum.FRUIT) {
      for (let i = 0; i < 15; i++) {
        let fruit = {}
        if (i / 3 < 3) {
          fruit = fruitCombos[i / 3];
        } else {
          fruit = fruitCombos[((i - 9) / 2) + 3];
        }
        arr[i] = new Card(Card.CardNameEnum.FRUIT, fruit);
      }
      if (playerNum < 6) {
      }
    } else if (dessertName === Card.CardNameEnum.PUDDING
      || dessertName === Card.CardNameEnum.GREEN_TEA_ICE_CREAM) {
      for (let i = 0; i < num; i++) {
        arr[i] = new Card(dessertName);
      }
    } else {
      console.log('Invalid dessert name.');
    }
    return arr;
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
]