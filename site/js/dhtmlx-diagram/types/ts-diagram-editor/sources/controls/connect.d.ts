import { Id } from "../../../ts-common/types";
import { Diagram, ItemConfig, ILineConfig } from "../../../ts-diagram";
import { Controls } from "./Controls";
interface ConnectionPoint {
    x: number;
    y: number;
    dx: number;
    dy: number;
    id: Id;
    side: string;
}
export declare class Connect {
    private _diagram;
    private _nearShape;
    private _nearPoint;
    private _connector;
    private _controls;
    private _isOrgType;
    constructor(controls: Controls, diagram: Diagram);
    getItemId(): Id;
    private _getItemDimensions;
    private _renderConnectionPoints;
    getPoints(targetItem: any, size: {
        top: number;
        left: number;
    }): any;
    createConnector: (point: ConnectionPoint) => void;
    setNearShape(shape: ItemConfig): void;
    toggleNearShape(shape: ItemConfig): void;
    removeNearShape(): void;
    moveConnector(_event: PointerEvent, item: ILineConfig, mov: any, p: any): void;
    onUp(event: PointerEvent): void;
    private _setNearPoint;
    private _removeNearPoint;
    private _getDistanceBetweenPoints;
    private _findNearShape;
}
export declare function getConnectPoints(item: ItemConfig, grip: number): ConnectionPoint[];
export {};
