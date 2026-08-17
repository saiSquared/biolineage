import { ICoords } from "../types";
export interface IHandlers {
    onMove: (event: PointerEvent, shift: ICoords, pressCoords: ICoords) => void;
    onUp: (event: PointerEvent) => void;
    connectOnUp?: (event: PointerEvent) => void;
}
export interface IDragConfig {
    scrollContainer: HTMLElement | null;
    scale: number;
    marginX: number;
    marginY: number;
    gridStep: number;
    scrollMargin?: number;
    maxScrollSpeed?: number;
}
declare class GlobalDrag {
    private _context;
    private _handlers;
    private _isMove;
    private _scroller;
    private _config;
    private _startLogic;
    private _lastSentStep;
    private _currentClient;
    start(event: PointerEvent, handler: IHandlers, config: IDragConfig, context?: any): void;
    private _getLogicalCoords;
    private _sync;
    private _moveHandler;
    private _upHandler;
}
export declare const drag: GlobalDrag;
export {};
