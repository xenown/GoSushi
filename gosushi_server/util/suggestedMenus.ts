import { RollsEnum, AppetizersEnum, SpecialsEnum, DessertsEnum }  from '../types/cardNameEnum';
import { ISuggestedMenus } from '../types/IMenu';

const suggestedMenus: ISuggestedMenus = {
  firstMeal: {
    roll: RollsEnum.MAKI,
    appetizers: [AppetizersEnum.TEMPURA, AppetizersEnum.SASHIMI, AppetizersEnum.MISO_SOUP],
    specials: [SpecialsEnum.WASABI, SpecialsEnum.TEA],
    dessert: DessertsEnum.GREEN_TEA_ICE_CREAM,
  },
  sushiGo: {
    roll: RollsEnum.MAKI,
    appetizers: [AppetizersEnum.TEMPURA, AppetizersEnum.SASHIMI, AppetizersEnum.DUMPLING],
    specials: [SpecialsEnum.CHOPSTICKS, SpecialsEnum.WASABI],
    dessert: DessertsEnum.PUDDING,
  },
  partySampler: {
    roll: RollsEnum.TEMAKI,
    appetizers: [AppetizersEnum.TEMPURA, AppetizersEnum.DUMPLING, AppetizersEnum.TOFU],
    specials: [SpecialsEnum.WASABI, SpecialsEnum.MENU],
    dessert: DessertsEnum.GREEN_TEA_ICE_CREAM,
  },
  masterMenu: {
    roll: RollsEnum.TEMAKI,
    appetizers: [AppetizersEnum.ONIGIRI, AppetizersEnum.TOFU, AppetizersEnum.SASHIMI],
    specials: [SpecialsEnum.SPOON, SpecialsEnum.TAKEOUT_BOX],
    dessert: DessertsEnum.FRUIT
  },
  pointsPlatter: {
    roll: RollsEnum.URAMAKI,
    appetizers: [AppetizersEnum.ONIGIRI, AppetizersEnum.DUMPLING, AppetizersEnum.EDAMAME],
    specials: [SpecialsEnum.SPECIAL_ORDER, SpecialsEnum.TEA],
    dessert: DessertsEnum.GREEN_TEA_ICE_CREAM,
  },
  cutthroatCombo: {
    roll: RollsEnum.TEMAKI,
    appetizers: [AppetizersEnum.EEL, AppetizersEnum.TOFU, AppetizersEnum.MISO_SOUP],
    specials: [SpecialsEnum.SPOON, SpecialsEnum.SOY_SAUCE],
    dessert: DessertsEnum.PUDDING,
  },
  bigBanquet: {
    roll: RollsEnum.MAKI,
    appetizers: [AppetizersEnum.TEMPURA, AppetizersEnum.DUMPLING, AppetizersEnum.EEL],
    specials: [SpecialsEnum.SPOON, SpecialsEnum.CHOPSTICKS],
    dessert: DessertsEnum.GREEN_TEA_ICE_CREAM,
  },
  dinnerForTwo: {
    roll: RollsEnum.URAMAKI,
    appetizers: [AppetizersEnum.ONIGIRI, AppetizersEnum.TOFU, AppetizersEnum.MISO_SOUP],
    specials: [SpecialsEnum.MENU,SpecialsEnum.SPECIAL_ORDER],
    dessert: DessertsEnum.FRUIT,
  },
};

export default suggestedMenus;
