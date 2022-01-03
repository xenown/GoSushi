import { SpecialsEnum, CardNameEnum }  from '../types/cardNameEnum';

const specialActionsHand: CardNameEnum[] = [
  SpecialsEnum.MENU,
  SpecialsEnum.SPECIAL_ORDER,
  SpecialsEnum.TAKEOUT_BOX,
];

const specialActionsPlayed: CardNameEnum[] = [SpecialsEnum.CHOPSTICKS, SpecialsEnum.SPOON];

export {
  specialActionsHand,
  specialActionsPlayed,
};
