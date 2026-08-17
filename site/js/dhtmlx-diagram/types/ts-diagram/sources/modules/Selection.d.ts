import { IEventSystem } from "../../../ts-common/events";
import { Id } from "../../../ts-common/types";
import { DataCollection, IDataItem } from "../../../ts-data";
import { SelectionEvents } from "../types";
/** Configuration for selecting a single item or a batch of items. */
export interface ISelectUnitConfig {
    /** The id of the item to select. */
    id: Id;
    /** Whether to add to the existing selection (multi-select) rather than replacing it. */
    join?: boolean;
    /** An array of additional item ids to include in the selection batch. */
    batch?: Id[];
}
/** Strict selection config that does not allow join mode. */
export interface ISelectStrictConfig extends Omit<ISelectUnitConfig, "join"> {
    /** Whether to perform strict matching (exact item id only). */
    strict?: boolean;
}
interface ISelection {
    events: IEventSystem<SelectionEvents, ISelectionEventsHandlersMap>;
    /**
     * Selects a diagram item by id.
     * When `join` is `false` (default), the current selection is cleared before selecting.
     * If the target item is a swimlane cell (`$sgroup`), the parent swimlane group is selected instead.
     *
     * Fires {@link SelectionEvents.beforeSelect} and {@link SelectionEvents.afterSelect}.
     * @param obj - The selection configuration object.
     * @returns `true` if the item was successfully selected, `false` if blocked by the `beforeSelect` event or the item was not found.
     */
    add(obj: ISelectUnitConfig): boolean;
    /**
     * Deselects one or all currently selected items.
     * When called without arguments, removes all items from the selection.
     * When called with an id, removes only that specific item.
     *
     * Fires {@link SelectionEvents.beforeUnSelect} and {@link SelectionEvents.afterUnSelect} for each item being deselected.
     * @param obj - Optional object containing the id of the item to deselect.
     * @returns `true` if the item(s) were successfully deselected, `false` if blocked by the `beforeUnSelect` event or the item is not selected.
     */
    remove(obj?: {
        id: Id;
    }): boolean;
    /**
     * Returns the data item object for a selected item.
     * When called without arguments, returns the most recently selected item.
     * When called with an id, returns that item if it is currently selected.
     * @param obj - Optional object containing the id of the item to retrieve.
     * @returns The data item object, or `undefined` if no matching item is selected.
     */
    getItem(obj?: {
        id: Id;
    }): IDataItem;
    /**
     * Checks whether a specific item is currently selected.
     * @param obj - The object containing the id to check.
     * @returns `true` if the item is in the current selection.
     */
    includes(obj: ISelectStrictConfig): boolean;
    /**
     * Returns an array of ids for all currently selected items.
     * @returns An array of selected item ids.
     */
    getIds(): Id[];
    /**
     * Clears all selection state without firing any events.
     */
    clear(): void;
}
/** Maps each {@link SelectionEvents} member to its handler function signature. */
interface ISelectionEventsHandlersMap {
    /** Index signature required for TypeScript compatibility with computed property keys. */
    [key: string]: (...args: any[]) => any;
    /** Fired after an item has been selected. */
    [SelectionEvents.afterSelect]: (obj: ISelectUnitConfig) => void;
    /** Fired after an item has been deselected. */
    [SelectionEvents.afterUnSelect]: (obj: Omit<ISelectUnitConfig, "join">) => void;
    /** Fired before an item is selected. Return `false` to prevent the selection. */
    [SelectionEvents.beforeSelect]: (obj: ISelectUnitConfig) => void | boolean;
    /** Fired before an item is deselected. Return `false` to prevent the deselection. */
    [SelectionEvents.beforeUnSelect]: (obj: Omit<ISelectUnitConfig, "join">) => void | boolean;
}
export declare class Selection implements ISelection {
    events: IEventSystem<SelectionEvents, ISelectionEventsHandlersMap>;
    private _data;
    private _selected;
    private _selectedLines;
    constructor(data: DataCollection, events: IEventSystem<any>);
    add({ id, join, batch }: ISelectUnitConfig): boolean;
    remove(obj?: {
        id: Id;
    }): boolean;
    includes({ id }: ISelectStrictConfig): boolean;
    getItem(obj?: {
        id: Id;
    } | undefined): IDataItem;
    getIds(): Id[];
    clear(): void;
    private unselect;
}
export {};
