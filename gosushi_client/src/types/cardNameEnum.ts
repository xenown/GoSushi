export enum NigiriEnum {
  EGG = 'Egg Nigiri',
  SALMON = 'Salmon Nigiri',
  SQUID = 'Squid Nigiri',
};

export enum RollsEnum {
  MAKI = 'Maki',
  TEMAKI = 'Temaki',
  URAMAKI = 'Uramaki',
};

export enum AppetizersEnum {
  DUMPLING = 'Dumpling',
  EDAMAME = 'Edamame',
  EEL = 'Eel',
  ONIGIRI = 'Onigiri',
  MISO_SOUP = 'Miso Soup',
  SASHIMI = 'Sashimi',
  TEMPURA = 'Tempura',
  TOFU = 'Tofu',
};

export enum SpecialsEnum {
  CHOPSTICKS = 'Chopsticks',
  SPOON = 'Spoon',
  MENU = 'Menu',
  TAKEOUT_BOX = 'Takeout Box',
  SOY_SAUCE = 'Soy Sauce',
  TEA = 'Tea',
  WASABI = 'Wasabi',
  SPECIAL_ORDER = 'Special Order',
};

export enum DessertsEnum {
  PUDDING = 'Pudding',
  GREEN_TEA_ICE_CREAM = 'Green Tea Ice Cream',
  FRUIT = 'Fruit',
};

export type CardNameEnum = NigiriEnum | RollsEnum | AppetizersEnum | SpecialsEnum | DessertsEnum;
export type MenuCardNameEnum = 'Nigiri' | RollsEnum | AppetizersEnum | SpecialsEnum | DessertsEnum;
