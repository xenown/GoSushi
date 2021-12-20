import CardNameEnum from './cardNameEnum';

export interface IMenu {
    roll: CardNameEnum,
    appetizers: CardNameEnum[],
    specials: CardNameEnum[],
    dessert: CardNameEnum,
}

export interface ISuggestedMenus {
  [key: string]: IMenu,
}

export default IMenu;
