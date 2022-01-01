import { AppetizersEnum, DessertsEnum, RollsEnum, SpecialsEnum } from './cardNameEnum';

export interface IMenu {
    roll: RollsEnum,
    appetizers: AppetizersEnum[],
    specials: SpecialsEnum[],
    dessert: DessertsEnum,
}

export interface ISuggestedMenus {
  [key: string]: IMenu,
}

export default IMenu;
