import { IEventSystem } from "../../../ts-common/events";
import { Id } from "../../../ts-common/types";
import { ShapesCollection } from "./ShapesCollection";
import { ActionDirection, ActionValidate, ICellType, ISwimlaneConfig } from "../types";
/** Enumeration of events fired by the CellManager for swimlane cell operations. */
export declare enum CellManagerEvents {
    /** Fired before new cells are added to a swimlane. Return `false` to prevent. */
    beforeCellsAdd = "beforeCellsAdd",
    /** Fired after new cells are added to a swimlane. */
    afterCellsAdd = "afterCellsAdd",
    /** Fired before cells are moved within a swimlane. Return `false` to prevent. */
    beforeCellsMove = "beforeCellsMove",
    /** Fired after cells are moved within a swimlane. */
    afterCellsMove = "afterCellsMove",
    /** Fired before cells are removed from a swimlane. Return `false` to prevent. */
    beforeCellsRemove = "beforeCellsRemove",
    /** Fired after cells are removed from a swimlane. */
    afterCellsRemove = "afterCellsRemove",
    /** Fired before a cell operation is validated. Return `false` to prevent. */
    beforeCellsValidation = "beforeCellsValidation",
    /** Fired after a cell operation has been validated. */
    afterCellsValidation = "afterCellsValidation"
}
/** Maps each {@link CellManagerEvents} member to its handler function signature. */
export interface ICellManagerHandlersMap {
    /** Index signature required for TypeScript compatibility with computed property keys. */
    [key: string]: (...args: any[]) => any;
    [CellManagerEvents.beforeCellsAdd]: (swimlaneId: Id) => boolean | void;
    [CellManagerEvents.afterCellsAdd]: (swimlaneId: Id) => void;
    [CellManagerEvents.beforeCellsMove]: (swimlaneId: Id) => boolean | void;
    [CellManagerEvents.afterCellsMove]: (swimlaneId: Id) => void;
    [CellManagerEvents.beforeCellsRemove]: (swimlaneId: Id) => boolean | void;
    [CellManagerEvents.afterCellsRemove]: (swimlaneId: Id) => void;
    [CellManagerEvents.beforeCellsValidation]: (swimlaneId: Id, action: ActionValidate) => boolean | void;
    [CellManagerEvents.afterCellsValidation]: (swimlaneId: Id, validate: boolean, action: ActionValidate) => void;
}
export interface ICellManager {
    /** The shapes data collection. */
    data: ShapesCollection;
    /** The currently active swimlane configuration, or `null` if no swimlane is selected. */
    swimlane: ISwimlaneConfig | null;
    /**
     * Sets the active swimlane for cell operations.
     * @param id - The id of the swimlane item.
     * @returns `true` if the swimlane was set successfully.
     */
    setSwimlane(id: Id): boolean;
    /** Resets the active swimlane selection. */
    resetSwimlane(): void;
    /**
     * Adds a new row or column of cells to the active swimlane.
     * @param cellIndex - The index at which to insert.
     * @param dir - The direction of insertion.
     * @param unstrict - Whether to skip validation.
     */
    add(cellIndex: number, dir: ActionDirection, unstrict?: boolean): void;
    /**
     * Moves a row or column of cells within the active swimlane.
     * @param cellIndex - The index of the cell to move.
     * @param dir - The direction to move.
     * @param unstrict - Whether to skip validation.
     */
    move(cellIndex: number, dir: ActionDirection, unstrict?: boolean): void;
    /**
     * Removes a row or column from the active swimlane.
     * @param cellIndex - The index of the cell to remove.
     * @param type - Whether to remove a row or column.
     * @param unstrict - Whether to skip validation.
     */
    remove(cellIndex: number, type: ICellType, unstrict?: boolean): void;
    /**
     * Validates whether a cell operation is allowed.
     * @param cellIndex - The target cell index.
     * @param dir - The direction of the operation.
     * @param action - The type of action to validate.
     * @returns `true` if the operation is valid.
     */
    validation(cellIndex: number, dir: ActionDirection, action: ActionValidate): boolean;
    /**
     * Returns the cell index associated with a sub-header id.
     * @param subheaderId - The id of the sub-header.
     */
    getSubHeaderCellIndex(subheaderId: string): number;
    /**
     * Returns the cell id associated with a sub-header id.
     * @param subheaderId - The id of the sub-header.
     */
    getSubHeaderCellId(subheaderId: string): Id | undefined;
    /**
     * Returns whether a sub-header belongs to a row or column.
     * @param subheaderId - The id of the sub-header.
     */
    getSubHeaderType(subheaderId: string): ICellType | undefined;
    /**
     * Returns the cell index for a given cell id and axis type.
     * @param cellId - The id of the cell.
     * @param type - Whether to look up by row or column.
     */
    getCellIndex(cellId: Id, type: ICellType): number | undefined;
    /**
     * Returns the cell id at a given index and axis type.
     * @param cellIndex - The index of the cell.
     * @param type - Whether to look up by row or column.
     */
    getCellId(cellIndex: number, type: ICellType): Id | undefined;
}
export declare class CellManager implements ICellManager {
    events: IEventSystem<CellManagerEvents, ICellManagerHandlersMap>;
    data: ShapesCollection;
    swimlane: ISwimlaneConfig;
    constructor(data: ShapesCollection, events: any);
    setSwimlane(id: Id): boolean;
    resetSwimlane(): void;
    add(cellIndex: number, dir: ActionDirection, unstrict?: boolean): void;
    move(cellIndex: number, dir: ActionDirection, unstrict?: boolean): void;
    remove(cellIndex: number, type: ICellType, unstrict?: boolean): void;
    validation(cellIndex: number, dir: ActionDirection, action: ActionValidate): boolean;
    getSubHeaderCellIndex(subheaderId: string): number;
    getSubHeaderCellId(subheaderId: string): Id | undefined;
    getSubHeaderType(subheaderId: string): ICellType | undefined;
    getCellIndex(cellId: Id, type: ICellType): number | undefined;
    getCellId(cellIndex: number, type: ICellType): Id | undefined;
    private getSubHeaderIndex;
    private getDirectionType;
    private getUniqueLayout;
}
