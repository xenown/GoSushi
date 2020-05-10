import * as menuImages from './menuImages';

export const rollsEnum = Object.freeze({
  MAKI: 'Maki',
  TEMAKI: 'Temaki',
  URAMAKI: 'Uramaki',
});

export const appetizersEnum = Object.freeze({
  DUMPLING: 'Dumpling',
  EDAMAME: 'Edamame',
  EEL: 'Eel',
  ONIGIRI: 'Onigiri',
  MISO_SOUP: 'Miso Soup',
  SASHIMI: 'Sashimi',
  TEMPURA: 'Tempura',
  TOFU: 'Tofu',
});

export const specialsEnum = Object.freeze({
  CHOPSTICKS: 'Chopsticks',
  SPOON: 'Spoon',
  MENU: 'Menu',
  TAKEOUT_BOX: 'Takeout Box',
  SOY_SAUCE: 'Soy Sauce',
  TEA: 'Tea',
  WASABI: 'Wasabi',
  SPECIAL_ORDER: 'Special Order',
});

export const dessertsEnum = Object.freeze({
  PUDDING: 'Pudding',
  GREEN_TEA_ICE_CREAM: 'Green Tea Ice Cream',
  FRUIT: 'Fruit',
});

export const menuCardImageMap = {
  Nigiri: menuImages.nigiri,
  Maki: menuImages.maki,
  Temaki: menuImages.temaki,
  Uramaki: menuImages.uramaki,
  Dumpling: menuImages.dumpling,
  Edamame: menuImages.edamame,
  Eel: menuImages.eel,
  Onigiri: menuImages.onigiri,
  'Miso Soup': menuImages.misosoup,
  Sashimi: menuImages.sashimi,
  Tempura: menuImages.tempura,
  Tofu: menuImages.tofu,
  Chopsticks: menuImages.chopsticks,
  Spoon: menuImages.spoon,
  Menu: menuImages.menu,
  'Takeout Box': menuImages.takeoutbox,
  'Soy Sauce': menuImages.soysauce,
  Tea: menuImages.tea,
  Wasabi: menuImages.wasabi,
  'Special Order': menuImages.specialorder,
  Pudding: menuImages.pudding,
  'Green Tea Ice Cream': menuImages.greenteaicecream,
  Fruit: menuImages.fruit,
};

export const MENU_APPETIZER_COUNT = 3;
export const MENU_SPECIAL_COUNT = 2;