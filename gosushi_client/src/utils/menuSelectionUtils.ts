import { menuImageMap } from './menuImages';
import {
  MenuCardNameEnum,
  RollsEnum,
  AppetizersEnum,
  SpecialsEnum,
  DessertsEnum,
} from '../types/cardNameEnum';

export const invalidMenuOptions: { [key: string]: number[] } = Object.freeze({
  Edamame: [2],
  Menu: [7, 8],
  Spoon: [2],
  'Special Order': [7, 8],
});

export const getMenuCardImage = (cardName: MenuCardNameEnum) => {
  switch (cardName) {
    case 'Nigiri':
      return menuImageMap.nigiri;
    case RollsEnum.MAKI:
      return menuImageMap.maki;
    case RollsEnum.TEMAKI:
      return menuImageMap.temaki;
    case RollsEnum.URAMAKI:
      return menuImageMap.uramaki;
    case AppetizersEnum.DUMPLING:
      return menuImageMap.dumpling;
    case AppetizersEnum.EDAMAME:
      return menuImageMap.edamame;
    case AppetizersEnum.EEL:
      return menuImageMap.eel;
    case AppetizersEnum.ONIGIRI:
      return menuImageMap.onigiri;
    case AppetizersEnum.MISO_SOUP:
      return menuImageMap.misosoup;
    case AppetizersEnum.SASHIMI:
      return menuImageMap.sashimi;
    case AppetizersEnum.TEMPURA:
      return menuImageMap.tempura;
    case AppetizersEnum.TOFU:
      return menuImageMap.tofu;
    case SpecialsEnum.CHOPSTICKS:
      return menuImageMap.chopsticks;
    case SpecialsEnum.SPOON:
      return menuImageMap.spoon;
    case SpecialsEnum.MENU:
      return menuImageMap.menu;
    case SpecialsEnum.TAKEOUT_BOX:
      return menuImageMap.takeoutbox;
    case SpecialsEnum.SOY_SAUCE:
      return menuImageMap.soysauce;
    case SpecialsEnum.TEA:
      return menuImageMap.tea;
    case SpecialsEnum.WASABI:
      return menuImageMap.wasabi;
    case SpecialsEnum.SPECIAL_ORDER:
      return menuImageMap.specialorder;
    case DessertsEnum.PUDDING:
      return menuImageMap.pudding;
    case DessertsEnum.GREEN_TEA_ICE_CREAM:
      return menuImageMap.greenteaicecream;
    case DessertsEnum.FRUIT:
      return menuImageMap.fruit;
    default:
      console.log(`Error: invalid menu card value ${cardName}.`);
      return menuImageMap.salmonNigiri;
  } // switch
};

export const MENU_APPETIZER_COUNT = 3;
export const MENU_SPECIAL_COUNT = 2;
