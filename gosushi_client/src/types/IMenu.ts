import {
  RollsEnum,
  AppetizersEnum,
  SpecialsEnum,
  DessertsEnum,
} from '../types/cardNameEnum';

export enum CourseEnum {
  ROLL = 'roll',
  APPETIZERS = 'appetizers',
  SPECIALS = 'specials',
  DESSERT = 'dessert',
};

export interface IOptionalMenu {
  roll?: RollsEnum,
  appetizers: AppetizersEnum[],
  specials: SpecialsEnum[],
  dessert?: DessertsEnum,
}

export interface IMenu {
  roll: RollsEnum,
  appetizers: AppetizersEnum[],
  specials: SpecialsEnum[],
  dessert: DessertsEnum,
}

export const getEmptyMenu = (): IOptionalMenu => {
  return {
    roll: undefined,
    appetizers: [],
    specials: [],
    dessert: undefined,
  }
}

export interface ISuggestedMenu extends IMenu {
  name: string,
}

export interface ISuggestedMenus {
  [key: string]: ISuggestedMenu,
}

export default IMenu;
