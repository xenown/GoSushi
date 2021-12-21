import Card from './card';
import CardNameEnum from '../types/cardNameEnum';
import IMenu from '../types/IMenu';
import OnigiriNameEnum from '../types/onigiriNameEnum';
import { drop, findIndex, isEqual, remove, shuffle, slice, take } from 'lodash';
import fruitCombos from '../util/fruitCombos';

class Deck {
  menu: IMenu;                // menu on which this deck is built on
  playableCards: Card[];      // all non-dessert cards in the deck
  desserts: Card[];           // all dessert cards in the deck
  activeDeck: Card[];         // usable cards in a given round (subset of playableCards intersected with the desserts)

  constructor(menu: IMenu, numPlayers: number) {
    this.menu = menu;
    this.playableCards = this.createNigiri()
      .concat(this.createRoll(menu.roll))
      .concat(this.createAppetizer(menu.appetizers[0]))
      .concat(this.createAppetizer(menu.appetizers[1]))
      .concat(this.createAppetizer(menu.appetizers[2]))
      .concat(this.createSpecial(menu.specials[0]))
      .concat(this.createSpecial(menu.specials[1]));
    this.desserts = this.createDesserts(menu.dessert, numPlayers);
    this.activeDeck = this.playableCards.map((c: Card) =>  new Card(c));
  }

  shuffle() {
    this.activeDeck = shuffle(this.activeDeck);
  }

  createNigiri() {
    let arr = [];
    for (let i = 0; i < 12; i++) {
      if (i < 4) {
        arr[i] = new Card(CardNameEnum.EGG, i);
      } else if (i > 8) {
        arr[i] = new Card(CardNameEnum.SQUID, i);
      } else {
        arr[i] = new Card(CardNameEnum.SALMON, i);
      } // if
    } // for
    return arr;
  }

  createRoll(rollName: CardNameEnum) {
    let arr = [];
    switch (rollName) {
      case CardNameEnum.MAKI:
        for (let i = 0; i < 12; i++) {
          if (i < 4) {
            arr[i] = new Card(CardNameEnum.MAKI, i, 1);
          } else if (i > 8) {
            arr[i] = new Card(CardNameEnum.MAKI, i, 3);
          } else {
            arr[i] = new Card(CardNameEnum.MAKI, i, 2);
          } // if
        } // for
        break;
      case CardNameEnum.TEMAKI:
        for (let i = 0; i < 12; i++) {
          arr[i] = new Card(CardNameEnum.TEMAKI, i);
        } // for
        break;
      case CardNameEnum.URAMAKI:
        for (let i = 0; i < 12; i++) {
          if (i < 4) {
            arr[i] = new Card(CardNameEnum.URAMAKI, i, 3);
          } else if (i > 7) {
            arr[i] = new Card(CardNameEnum.URAMAKI, i, 5);
          } else {
            arr[i] = new Card(CardNameEnum.URAMAKI, i, 4);
          } // if
        } // for
        break;
      default:
        console.log('Invalid roll name.');
    } // switch
    return arr;
  }

  createAppetizer(appetizerName: CardNameEnum) {
    let arr = [];
    if (appetizerName === CardNameEnum.ONIGIRI) {
      for (let i = 0; i < 8; i++) {
        if (i % 4 === 0) {
          arr[i] = new Card(CardNameEnum.ONIGIRI, i, OnigiriNameEnum.CIRCLE);
        } else if (i % 4 === 1) {
          arr[i] = new Card(CardNameEnum.ONIGIRI, i, OnigiriNameEnum.TRIANGLE);
        } else if (i % 4 === 2) {
          arr[i] = new Card(CardNameEnum.ONIGIRI, i, OnigiriNameEnum.SQUARE);
        } else {
          arr[i] = new Card(CardNameEnum.ONIGIRI, i, OnigiriNameEnum.RECTANGLE);
        } // if
      } // for
    } else if (Object.values(CardNameEnum).includes(appetizerName)) {
      for (let i = 0; i < 8; i++) {
        arr[i] = new Card(appetizerName, i);
      } // for
    } else {
      console.log('Invalid appetizer name.');
    } // if
    return arr;
  }

  createSpecial(specialName: CardNameEnum) {
    let arr = [];
    for (let i = 0; i < 3; i++) {
      if (specialName === CardNameEnum.CHOPSTICKS) {
        arr[i] = new Card(CardNameEnum.CHOPSTICKS, i, i + 1);
      } else if (specialName === CardNameEnum.SPOON) {
        arr[i] = new Card(CardNameEnum.SPOON, i, i + 4);
      } else if (specialName === CardNameEnum.MENU) {
        arr[i] = new Card(CardNameEnum.MENU, i, i + 7);
      } else if (specialName === CardNameEnum.TAKEOUT_BOX) {
        arr[i] = new Card(CardNameEnum.TAKEOUT_BOX, i, i + 10);
      } else if (Object.values(CardNameEnum).includes(specialName)) {
        arr[i] = new Card(specialName, i);
      } else {
        console.log('Invalid special name.');
        break;
      } // if
    } // for
    return arr;
  }

  createDesserts(dessertName: CardNameEnum, numPlayers: number) {
    let arr = [];
    if (dessertName === CardNameEnum.FRUIT) {
      for (let i = 0; i < 15; i++) {
        let fruit = {};
        if (i / 3 < 3) {
          fruit = fruitCombos[Math.floor(i / 3)];
        } else {
          fruit = fruitCombos[Math.floor((i - 9) / 2) + 3];
        }
        arr[i] = new Card(CardNameEnum.FRUIT, i, fruit);
      } // for
      if (numPlayers < 6) {
        arr = slice(shuffle(arr), 5);
      } // if
    } else if (
      dessertName === CardNameEnum.PUDDING ||
      dessertName === CardNameEnum.GREEN_TEA_ICE_CREAM
    ) {
      const num = numPlayers > 5 ? 15 : 10;
      for (let i = 0; i < num; i++) {
        arr[i] = new Card(dessertName, i);
      } // for
    } else {
      console.log('Invalid dessert name.');
    } // if
    return arr;
  }

  resetDeck(numDesserts: number) {
    remove(this.activeDeck, (c: Card) => c.name !== this.menu.dessert);
    this.activeDeck = this.activeDeck.concat(this.playableCards);
    this.addDesserts(numDesserts);
  }

  addDesserts(num: number) {
    this.activeDeck = this.activeDeck.concat(this.desserts.slice(0, num));
    this.desserts = this.desserts.slice(num);
  }

  dealHand(num: number) {
    const hand = take(this.activeDeck, num);
    this.activeDeck = drop(this.activeDeck, num);
    return hand;
  }

  removeOneAndShuffle(card: Card) {
    let chosenCard = new Card(card);
    let index = findIndex(this.activeDeck, (c: Card) => isEqual(c, chosenCard));
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

export default Deck;
