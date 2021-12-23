import { cardImageMap } from './cardImages';
import ICard from '../types/ICard';

export const getCardImage = (card: ICard) => {
  switch (card.name) {
    case 'Egg Nigiri':
      return cardImageMap.eggNigiri;
    case 'Salmon Nigiri':
      return cardImageMap.salmonNigiri;
    case 'Squid Nigiri':
      return cardImageMap.squidNigiri;
    case 'Maki':
      return cardImageMap[`maki${card.data}`];
    case 'Temaki':
      return cardImageMap.temaki;
    case 'Uramaki':
      return cardImageMap[`uramaki${card.data}`];
    case 'Dumpling':
      return cardImageMap.dumpling;
    case 'Edamame':
      return cardImageMap.edamame;
    case 'Eel':
      return cardImageMap.eel;
    case 'Onigiri':
      return cardImageMap[`onigiri${card.data}`];
    case 'Miso Soup':
      return cardImageMap.misosoup;
    case 'Sashimi':
      return cardImageMap.sashimi;
    case 'Tempura':
      return cardImageMap.tempura;
    case 'Tofu':
      return cardImageMap.tofu;
    case 'Chopsticks':
      return cardImageMap[`chopsticks${card.data}`];
    case 'Spoon':
      return cardImageMap[`spoon${card.data}`];
    case 'Menu':
      return cardImageMap[`menu${card.data}`];
    case 'Takeout Box':
      return cardImageMap[`takeoutbox${card.data}`];
    case 'Soy Sauce':
      return cardImageMap.soysauce;
    case 'Tea':
      return cardImageMap.tea;
    case 'Wasabi':
      return cardImageMap.wasabi;
    case 'Special Order':
      return cardImageMap.specialorder;
    case 'Pudding':
      return cardImageMap.pudding;
    case 'Green Tea Ice Cream':
      return cardImageMap.greenteaicecream;
    case 'Fruit':
      const value = Object.values(card.data).join('');
      return cardImageMap[`fruit${value}`];
    default:
      console.log(`Error: invalid card value ${card.name}, ${card.data}.`);
      return cardImageMap.salmonNigiri;
  } // switch
};
