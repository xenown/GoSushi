import { RollsEnum, AppetizersEnum, SpecialsEnum, DessertsEnum } from '../types/cardNameEnum';
import { ISuggestedMenus } from '../types/IMenu';

export const suggestedMenus: ISuggestedMenus = Object.freeze({
  firstMeal: {
    roll: RollsEnum.MAKI,
    appetizers: [AppetizersEnum.TEMPURA, AppetizersEnum.SASHIMI, AppetizersEnum.MISO_SOUP],
    specials: [SpecialsEnum.WASABI, SpecialsEnum.TEA],
    dessert: DessertsEnum.GREEN_TEA_ICE_CREAM,
    name: 'First Meal'
  },
  sushiGo: {
    roll: RollsEnum.MAKI,
    appetizers: [AppetizersEnum.TEMPURA, AppetizersEnum.SASHIMI, AppetizersEnum.DUMPLING],
    specials: [SpecialsEnum.CHOPSTICKS, SpecialsEnum.WASABI],
    dessert: DessertsEnum.PUDDING,
    name: 'SushiGo!'
  },
  partySampler: {
    roll: RollsEnum.TEMAKI,
    appetizers: [AppetizersEnum.TEMPURA, AppetizersEnum.DUMPLING, AppetizersEnum.TOFU],
    specials: [SpecialsEnum.WASABI, SpecialsEnum.MENU],
    dessert: DessertsEnum.GREEN_TEA_ICE_CREAM,
    name: 'Party Sampler'
  },
  masterMenu: {
    roll: RollsEnum.TEMAKI,
    appetizers: [AppetizersEnum.ONIGIRI, AppetizersEnum.TOFU, AppetizersEnum.SASHIMI],
    specials: [SpecialsEnum.SPOON, SpecialsEnum.TAKEOUT_BOX],
    dessert: DessertsEnum.FRUIT,
    name: 'Master Menu'
  },
  pointsPlatter: {
    roll: RollsEnum.URAMAKI,
    appetizers: [AppetizersEnum.ONIGIRI, AppetizersEnum.DUMPLING, AppetizersEnum.EDAMAME],
    specials: [SpecialsEnum.SPECIAL_ORDER, SpecialsEnum.TEA],
    dessert: DessertsEnum.GREEN_TEA_ICE_CREAM,
    name: 'Points Platter'
  },
  cutthroatCombo: {
    roll: RollsEnum.TEMAKI,
    appetizers: [AppetizersEnum.EEL, AppetizersEnum.TOFU, AppetizersEnum.MISO_SOUP],
    specials: [SpecialsEnum.SPOON, SpecialsEnum.SOY_SAUCE],
    dessert: DessertsEnum.PUDDING,
    name: 'Cutthroat Combo'
  },
  bigBanquet: {
    roll: RollsEnum.MAKI,
    appetizers: [AppetizersEnum.TEMPURA, AppetizersEnum.DUMPLING, AppetizersEnum.EEL],
    specials: [SpecialsEnum.SPOON, SpecialsEnum.CHOPSTICKS],
    dessert: DessertsEnum.GREEN_TEA_ICE_CREAM,
    name: 'Big Banquet'
  },
  dinnerForTwo: {
    roll: RollsEnum.URAMAKI,
    appetizers: [AppetizersEnum.ONIGIRI, AppetizersEnum.TOFU, AppetizersEnum.MISO_SOUP],
    specials: [SpecialsEnum.MENU, SpecialsEnum.SPECIAL_ORDER],
    dessert: DessertsEnum.FRUIT,
    name: 'Dinner For Two'
  },
});
