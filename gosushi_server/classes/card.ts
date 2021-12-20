class Card {
  isFlipped: boolean = false;
  name: string = "";
  id: number = 0;
  data: any;

  constructor(card: Card | string, id: number = 0, data: any = null) {
    if (card instanceof Card) {
      // copy constructor
      Object.assign(this, card);
    } else if (typeof card === 'string') {
      this.isFlipped = false;
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
