import { NigiriEnum, RollsEnum, AppetizersEnum, SpecialsEnum, DessertsEnum, CardNameEnum }  from '../types/cardNameEnum';

const nigiris = [NigiriEnum.EGG, NigiriEnum.SALMON, NigiriEnum.SQUID];

const rolls = [RollsEnum.MAKI, RollsEnum.TEMAKI, RollsEnum.URAMAKI];

const appetizers = [
  AppetizersEnum.DUMPLING,
  AppetizersEnum.EDAMAME,
  AppetizersEnum.EEL,
  AppetizersEnum.ONIGIRI,
  AppetizersEnum.MISO_SOUP,
  AppetizersEnum.SASHIMI,
  AppetizersEnum.TEMPURA,
  AppetizersEnum.TOFU,
];

const specials = [
  SpecialsEnum.CHOPSTICKS,
  SpecialsEnum.MENU,
  SpecialsEnum.SOY_SAUCE,
  SpecialsEnum.SPECIAL_ORDER,
  SpecialsEnum.SPOON,
  SpecialsEnum.TAKEOUT_BOX,
  SpecialsEnum.TEA,
  SpecialsEnum.WASABI,
];

const desserts = [
  DessertsEnum.PUDDING,
  DessertsEnum.GREEN_TEA_ICE_CREAM,
  DessertsEnum.FRUIT,
];

const specialActionsHand: CardNameEnum[] = [
  SpecialsEnum.MENU,
  SpecialsEnum.SPECIAL_ORDER,
  SpecialsEnum.TAKEOUT_BOX,
];

const specialActionsPlayed: CardNameEnum[] = [SpecialsEnum.CHOPSTICKS, SpecialsEnum.SPOON];

export {
  nigiris,
  appetizers,
  rolls,
  specials,
  desserts,
  specialActionsHand,
  specialActionsPlayed,
};
