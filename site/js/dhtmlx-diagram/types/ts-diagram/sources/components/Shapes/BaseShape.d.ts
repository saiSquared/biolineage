import { IBaseShape, IBaseShapeConfig, IBaseCoords, ConnectSide } from "../../../../ts-diagram";
import { BaseItem } from "../BaseItem";
export declare class BaseShape extends BaseItem implements IBaseShape {
    constructor(config: IBaseShapeConfig, params?: any);
    getCenter(): IBaseCoords;
    getPoint(x: number, y: number, baseX?: number, baseY?: number): IBaseCoords;
    getConnectionPoint(coords: IBaseCoords, side: ConnectSide, gap?: number): IBaseCoords;
}
