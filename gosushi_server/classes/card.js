const CardNameEnum = Object.freeze({
  EGG: 'Egg Nigiri',
  SALMON: 'Salmon Nigiri',
  SQUID: 'Squid Nigiri',
  MAKI: 'Maki',
  TEMAKI: 'Temaki',
  URAMAKI: 'Uramaki',
  DUMPLING: 'Dumpling',
  EDAMAME: 'Edamame',
  EEL: 'Eel',
  ONIGIRI: 'Onigiri',
  MISO_SOUP: 'Miso Soup',
  SASHIMI: 'Sashimi',
  TEMPURA: 'Tempura',
  TOFU: 'Tofu',
  CHOPSTICKS: 'Chopsticks',
  SPOON: 'Spoon',
  MENU: 'Menu',
  TAKEOUT_BOX: 'Takeout Box',
  SOY_SAUCE: 'Soy Sauce',
  TEA: 'Tea',
  WASABI: 'Wasabi',
  SPECIAL_ORDER: 'Special Order',
  PUDDING: 'Pudding',
  GREEN_TEA_ICE_CREAM: 'Green Tea Ice Cream',
  FRUIT: 'Fruit',
});

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
  printSomething(text) {
    console.log(text);
  }
}

module.exports = Card;
module.exports.CardNameEnum = CardNameEnum;
module.exports.OnigiriEnum = OnigiriEnum;
