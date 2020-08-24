import * as cardImages from './cardImages';

export const getCardImage = card => {
  switch (card.name) {
    case 'Egg Nigiri':
      return cardImages.eggNigiri;
    case 'Salmon Nigiri':
      return cardImages.salmonNigiri;
    case 'Squid Nigiri':
      return cardImages.squidNigiri;
    case 'Maki':
      return cardImages[`maki${card.data}`];
    case 'Temaki':
      return cardImages.temaki;
    case 'Uramaki':
      return cardImages[`uramaki${card.data}`];
    case 'Dumpling':
      return cardImages.dumpling;
    case 'Edamame':
      return cardImages.edamame;
    case 'Eel':
      return cardImages.eel;
    case 'Onigiri':
      return cardImages[`onigiri${card.data}`];
    case 'Miso Soup':
      return cardImages.misosoup;
    case 'Sashimi':
      return cardImages.sashimi;
    case 'Tempura':
      return cardImages.tempura;
    case 'Tofu':
      return cardImages.tofu;
    case 'Chopsticks':
      return cardImages[`chopsticks${card.data}`];
    case 'Spoon':
      return cardImages[`spoon${card.data}`];
    case 'Menu':
      return cardImages[`menu${card.data}`];
    case 'Takeout Box':
      return cardImages[`takeoutbox${card.data}`];
    case 'Soy Sauce':
      return cardImages.soysauce;
    case 'Tea':
      return cardImages.tea;
    case 'Wasabi':
      return cardImages.wasabi;
    case 'Special Order':
      return cardImages.specialorder;
    case 'Pudding':
      return cardImages.pudding;
    case 'Green Tea Ice Cream':
      return cardImages.greenteaicecream;
    case 'Fruit':
      const value = Object.values(card.data).join('');
      return cardImages[`fruit${value}`];
    default:
      console.log(`Error: invalid card value ${card.name}, ${card.data}.`);
      return cardImages.salmonNigiri;
  }
};
