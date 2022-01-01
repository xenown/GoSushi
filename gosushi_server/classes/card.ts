import { CardNameEnum, NigiriEnum } from "../types/cardNameEnum";

class Card {
  isFlipped: boolean = false;
  name: CardNameEnum = NigiriEnum.EGG;
  id: number = 0;
  data: any;

  constructor(card: Card | CardNameEnum, id: number = 0, data: any = null, isFlipped = false) {
    if (typeof card === 'object') {
      // copy constructor
      Object.assign(this, card);
    } else {
      this.isFlipped = isFlipped;
      this.name = card;
      this.data = data;
      this.id = id;
    } // if
  } // constructor

  print() {
    console.log(this);
    if (this.data) {
      console.log(`data: ${this.data}`);
    } // if
  } // print
} // Card

export default Card;
