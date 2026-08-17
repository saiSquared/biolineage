import { VNode } from "../../../../ts-common/dom";
import { BaseShape } from "./BaseShape";
import { ConnectSide, IBaseCoords, ITaskShapeConfig } from "../../types";
export declare class TaskShape extends BaseShape {
    config: ITaskShapeConfig;
    private _dateFormat;
    constructor(config: ITaskShapeConfig, params?: any);
    render(): VNode;
    getConnectionPoint(coords: IBaseCoords, side: ConnectSide, gap?: number): IBaseCoords;
    protected setDefaults(config: ITaskShapeConfig, defaults?: ITaskShapeConfig): ITaskShapeConfig;
    private _getFormattedDate;
}
