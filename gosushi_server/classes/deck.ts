import Card from './card';
import { NigiriEnum, RollsEnum, AppetizersEnum, SpecialsEnum, DessertsEnum }  from '../types/cardNameEnum';
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
        arr[i] = new Card(NigiriEnum.EGG, i);
      } else if (i > 8) {
        arr[i] = new Card(NigiriEnum.SQUID, i);
      } else {
        arr[i] = new Card(NigiriEnum.SALMON, i);
      } // if
    } // for
    return arr;
  }

  createRoll(rollName: RollsEnum) {
    let arr = [];
    switch (rollName) {
      case RollsEnum.MAKI:
        for (let i = 0; i < 12; i++) {
          if (i < 4) {
            arr[i] = new Card(RollsEnum.MAKI, i, 1);
          } else if (i > 8) {
            arr[i] = new Card(RollsEnum.MAKI, i, 3);
          } else {
            arr[i] = new Card(RollsEnum.MAKI, i, 2);
          } // if
        } // for
        break;
      case RollsEnum.TEMAKI:
        for (let i = 0; i < 12; i++) {
          arr[i] = new Card(RollsEnum.TEMAKI, i);
        } // for
        break;
      case RollsEnum.URAMAKI:
        for (let i = 0; i < 12; i++) {
          if (i < 4) {
            arr[i] = new Card(RollsEnum.URAMAKI, i, 3);
          } else if (i > 7) {
            arr[i] = new Card(RollsEnum.URAMAKI, i, 5);
          } else {
            arr[i] = new Card(RollsEnum.URAMAKI, i, 4);
          } // if
        } // for
        break;
      default:
        console.log('Invalid roll name.');
    } // switch
    return arr;
  }

  createAppetizer(appetizerName: AppetizersEnum) {
    let arr = [];
    if (appetizerName === AppetizersEnum.ONIGIRI) {
      for (let i = 0; i < 8; i++) {
        if (i % 4 === 0) {
          arr[i] = new Card(AppetizersEnum.ONIGIRI, i, OnigiriNameEnum.CIRCLE);
        } else if (i % 4 === 1) {
          arr[i] = new Card(AppetizersEnum.ONIGIRI, i, OnigiriNameEnum.TRIANGLE);
        } else if (i % 4 === 2) {
          arr[i] = new Card(AppetizersEnum.ONIGIRI, i, OnigiriNameEnum.SQUARE);
        } else {
          arr[i] = new Card(AppetizersEnum.ONIGIRI, i, OnigiriNameEnum.RECTANGLE);
        } // if
      } // for
    } else if (Object.values(AppetizersEnum).includes(appetizerName)) {
      for (let i = 0; i < 8; i++) {
        arr[i] = new Card(appetizerName, i);
      } // for
    } else {
      console.log('Invalid appetizer name.');
    } // if
    return arr;
  }

  createSpecial(specialName: SpecialsEnum) {
    let arr = [];
    for (let i = 0; i < 3; i++) {
      if (specialName === SpecialsEnum.CHOPSTICKS) {
        arr[i] = new Card(SpecialsEnum.CHOPSTICKS, i, i + 1);
      } else if (specialName === SpecialsEnum.SPOON) {
        arr[i] = new Card(SpecialsEnum.SPOON, i, i + 4);
      } else if (specialName === SpecialsEnum.MENU) {
        arr[i] = new Card(SpecialsEnum.MENU, i, i + 7);
      } else if (specialName === SpecialsEnum.TAKEOUT_BOX) {
        arr[i] = new Card(SpecialsEnum.TAKEOUT_BOX, i, i + 10);
      } else if (Object.values(SpecialsEnum).includes(specialName)) {
        arr[i] = new Card(specialName, i);
      } else {
        console.log('Invalid special name.');
        break;
      } // if
    } // for
    return arr;
  }

  createDesserts(dessertName: DessertsEnum, numPlayers: number) {
    let arr = [];
    if (dessertName === DessertsEnum.FRUIT) {
      for (let i = 0; i < 15; i++) {
        let fruit = {};
        if (i / 3 < 3) {
          fruit = fruitCombos[Math.floor(i / 3)];
        } else {
          fruit = fruitCombos[Math.floor((i - 9) / 2) + 3];
        }
        arr[i] = new Card(DessertsEnum.FRUIT, i, fruit);
      } // for
      if (numPlayers < 6) {
        arr = slice(shuffle(arr), 5);
      } // if
    } else if (
      dessertName === DessertsEnum.PUDDING ||
      dessertName === DessertsEnum.GREEN_TEA_ICE_CREAM
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
