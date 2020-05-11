import {rollsEnum, appetizersEnum, specialsEnum, dessertsEnum } from './menuSelectionUtils'

export const suggestedMenus = Object.freeze({
  firstMeal: {
    roll: rollsEnum.MAKI,
    appetizers: [appetizersEnum.TEMPURA, appetizersEnum.SASHIMI, appetizersEnum.MISO_SOUP],
    specials: [specialsEnum.WASABI, specialsEnum.TEA],
    dessert: dessertsEnum.GREEN_TEA_ICE_CREAM,
  },
  sushiGo: {
    roll: rollsEnum.MAKI,
    appetizers: [appetizersEnum.TEMPURA, appetizersEnum.SASHIMI, appetizersEnum.DUMPLING],
    specials: [specialsEnum.CHOPSTICKS, specialsEnum.WASABI],
    dessert: dessertsEnum.PUDDING,
  },
  partySampler: {
    roll: rollsEnum.TEMAKI,
    appetizers: [appetizersEnum.TEMPURA, appetizersEnum.DUMPLING, appetizersEnum.TOFU],
    specials: [specialsEnum.WASABI, specialsEnum.MENU],
    dessert: dessertsEnum.GREEN_TEA_ICE_CREAM,
  },
  masterMenu: {
    roll: rollsEnum.TEMAKI,
    appetizers: [appetizersEnum.ONIGIRI, appetizersEnum.TOFU, appetizersEnum.SASHIMI],
    specials: [specialsEnum.SPOON, specialsEnum.TAKEOUT_BOX],
    dessert: dessertsEnum.FRUIT,
  },
  pointsPlatter: {
    roll: rollsEnum.URAMAKI,
    appetizers: [appetizersEnum.ONIGIRI, appetizersEnum.DUMPLING, appetizersEnum.EDAMAME],
    specials: [specialsEnum.SPECIAL_ORDER, specialsEnum.TEA],
    dessert: dessertsEnum.GREEN_TEA_ICE_CREAM,
  },
  cutthroatCombo: {
    roll: rollsEnum.TEMAKI,
    appetizers: [appetizersEnum.EEL, appetizersEnum.TOFU, appetizersEnum.MISO_SOUP],
    specials: [specialsEnum.SPOON, specialsEnum.SOY_SAUCE],
    dessert: dessertsEnum.PUDDING,
  },
  bigBanquet: {
    roll: rollsEnum.MAKI,
    appetizers: [appetizersEnum.TEMPURA, appetizersEnum.DUMPLING, appetizersEnum.EEL],
    specials: [specialsEnum.SPOON, specialsEnum.CHOPSTICKS],
    dessert: dessertsEnum.GREEN_TEA_ICE_CREAM,
  },
  dinnerForTwo: {
    roll: rollsEnum.URAMAKI,
    appetizers: [appetizersEnum.ONIGIRI, appetizersEnum.TOFU, appetizersEnum.MISO_SOUP],
    specials: [specialsEnum.MENU, specialsEnum.SPECIAL_ORDER],
    dessert: dessertsEnum.FRUIT,
  },
});