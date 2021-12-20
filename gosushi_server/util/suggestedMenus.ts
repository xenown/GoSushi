import CardNameEnum from '../types/cardNameEnum';
import { ISuggestedMenus } from '../types/IMenu';

const suggestedMenus: ISuggestedMenus = {
  firstMeal: {
    roll: CardNameEnum.MAKI,
    appetizers: [CardNameEnum.TEMPURA, CardNameEnum.SASHIMI, CardNameEnum.MISO_SOUP],
    specials: [CardNameEnum.WASABI, CardNameEnum.TEA],
    dessert: CardNameEnum.GREEN_TEA_ICE_CREAM,
  },
  sushiGo: {
    roll: CardNameEnum.MAKI,
    appetizers: [CardNameEnum.TEMPURA, CardNameEnum.SASHIMI, CardNameEnum.DUMPLING],
    specials: [CardNameEnum.CHOPSTICKS, CardNameEnum.WASABI],
    dessert: CardNameEnum.PUDDING,
  },
  partySampler: {
    roll: CardNameEnum.TEMAKI,
    appetizers: [CardNameEnum.TEMPURA, CardNameEnum.DUMPLING, CardNameEnum.TOFU],
    specials: [CardNameEnum.WASABI, CardNameEnum.MENU],
    dessert: CardNameEnum.GREEN_TEA_ICE_CREAM,
  },
  masterMenu: {
    roll: CardNameEnum.TEMAKI,
    appetizers: [CardNameEnum.ONIGIRI, CardNameEnum.TOFU, CardNameEnum.SASHIMI],
    specials: [CardNameEnum.SPOON, CardNameEnum.TAKEOUT_BOX],
    dessert: CardNameEnum.FRUIT
  },
  pointsPlatter: {
    roll: CardNameEnum.URAMAKI,
    appetizers: [CardNameEnum.ONIGIRI, CardNameEnum.DUMPLING, CardNameEnum.EDAMAME],
    specials: [CardNameEnum.SPECIAL_ORDER, CardNameEnum.TEA],
    dessert: CardNameEnum.GREEN_TEA_ICE_CREAM,
  },
  cutthroatCombo: {
    roll: CardNameEnum.TEMAKI,
    appetizers: [CardNameEnum.EEL, CardNameEnum.TOFU, CardNameEnum.MISO_SOUP],
    specials: [CardNameEnum.SPOON, CardNameEnum.SOY_SAUCE],
    dessert: CardNameEnum.PUDDING,
  },
  bigBanquet: {
    roll: CardNameEnum.MAKI,
    appetizers: [CardNameEnum.TEMPURA, CardNameEnum.DUMPLING, CardNameEnum.EEL],
    specials: [CardNameEnum.SPOON, CardNameEnum.CHOPSTICKS],
    dessert: CardNameEnum.GREEN_TEA_ICE_CREAM,
  },
  dinnerForTwo: {
    roll: CardNameEnum.URAMAKI,
    appetizers: [CardNameEnum.ONIGIRI, CardNameEnum.TOFU, CardNameEnum.MISO_SOUP],
    specials: [CardNameEnum.MENU,CardNameEnum.SPECIAL_ORDER],
    dessert: CardNameEnum.FRUIT,
  },
};

export default suggestedMenus;
