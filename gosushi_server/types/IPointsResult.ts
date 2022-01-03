import { MenuCardNameEnum } from "./cardNameEnum";

export type IPlayerResult = {
    [cardName in MenuCardNameEnum]?: number;
}

export default interface IPointsResult {
    [key: string]: IPlayerResult;
}
