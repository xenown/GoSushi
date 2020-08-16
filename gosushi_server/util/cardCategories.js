const CardNameEnum = require('./cardNameEnum');

const nigiris = [CardNameEnum.EGG, CardNameEnum.SALMON, CardNameEnum.SQUID];

const rolls = [CardNameEnum.MAKI, CardNameEnum.TEMAKI, CardNameEnum.URAMAKI];

const appetizers = [
  CardNameEnum.DUMPLING,
  CardNameEnum.EDAMAME,
  CardNameEnum.EEL,
  CardNameEnum.ONIGIRI,
  CardNameEnum.MISO_SOUP,
  CardNameEnum.SASHIMI,
  CardNameEnum.TEMPURA,
  CardNameEnum.TOFU,
];

const specials = [
  CardNameEnum.CHOPSTICKS,
  CardNameEnum.MENU,
  CardNameEnum.SOY_SAUCE,
  CardNameEnum.SPECIAL_ORDER,
  CardNameEnum.SPOON,
  CardNameEnum.TAKEOUT_BOX,
  CardNameEnum.TEA,
  CardNameEnum.WASABI,
];

const desserts = [
  CardNameEnum.PUDDING,
  CardNameEnum.GREEN_TEA_ICE_CREAM,
  CardNameEnum.FRUIT,
];

const specialActionsHand = [
  CardNameEnum.MENU,
  CardNameEnum.SPECIAL_ORDER,
  CardNameEnum.TAKEOUT_BOX,
];

const specialActionsPlayed = [CardNameEnum.CHOPSTICKS, CardNameEnum.SPOON];

module.exports = {
  nigiris,
  appetizers,
  rolls,
  specials,
  desserts,
  specialActionsHand,
  specialActionsPlayed,
};
