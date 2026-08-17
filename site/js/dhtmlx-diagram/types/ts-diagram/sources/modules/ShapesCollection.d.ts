import { Callback, IEventSystem } from "../../../ts-common/events";
import { Id } from "../../../ts-common/types";
import { DataCollection, DataDriver, IDataConfig, IDataDriver, IDataItem } from "../../../ts-data";
import { DataEvents, IDiagramConfig, ItemConfig } from "../types";
/** Configuration for the shapes data collection, extending the base data config with diagram-specific settings. */
interface IShapeCollectionConfig extends IDataConfig {
    /** The parent diagram configuration object. */
    diagramConfig: IDiagramConfig;
}
/** Data structure for loading PERT chart data with separate data and links arrays. */
export interface IPertData {
    /** The array of PERT task/milestone item configurations. */
    data: IDataItem[];
    /** The array of link (dependency) item configurations. */
    links: IDataItem[];
}
export declare class ShapesCollection extends DataCollection {
    config: IShapeCollectionConfig;
    private _groupChildren;
    private _children;
    private _roots;
    constructor(config: IShapeCollectionConfig, events: IEventSystem<DataEvents>);
    private get _diagramType();
    /**
     * Returns the child items of the specified shape.
     * In tree mode (default), recursively collects all descendants.
     * In flat mode, returns only direct children.
     * @param id - The id of the parent item.
     * @param isTree - Whether to recursively collect all descendants. Defaults to `true`.
     * @returns An array of child data items.
     */
    getChildren(id: Id, isTree?: boolean): IDataItem[];
    /**
     * Iterates over the children of the specified item, invoking the callback for each child.
     * In tree mode (default), traverses all descendants recursively.
     * @param id - The id of the parent item.
     * @param callback - The function to call for each child item.
     * @param isTree - Whether to recurse into nested children. Defaults to `true`.
     */
    eachChild(id: Id, callback: Callback, isTree?: boolean): void;
    /**
     * Iterates up the parent chain from the specified item, invoking the callback for each ancestor.
     * @param id - The id of the starting item.
     * @param callback - The function to call for each parent item.
     * @param self - Whether to include the starting item itself. Defaults to `false`.
     */
    eachParent(id: Id, callback: Callback, self?: boolean): void;
    /**
     * Resolves the nearest visible ancestor id for a given item.
     * In hierarchical modes (org/mindmap), if the item has a collapsed ancestor, returns that
     * ancestor's id instead. For non-hierarchical modes, returns the item's own id.
     * @param id - The id of the item to resolve.
     * @returns The id of the nearest visible ancestor, or the item's own id if fully visible.
     */
    getNearId(id: Id): Id;
    /**
     * Maps over all visible items, applying the handler function to each.
     * In hierarchical modes (org/mindmap), only traverses expanded branches.
     * In default/PERT modes, skips hidden items and hidden line endpoints.
     * @param handler - The mapping function to apply to each visible item.
     * @returns An array of results from the handler function.
     */
    mapVisible(handler: (item: IDataItem) => any): any[];
    /**
     * Returns the ids of all root-level items (items with no parent).
     * @returns An array of root item ids.
     */
    getRoots(): Id[];
    /**
     * Finds the root ancestor of the specified item by traversing up the parent/group chain.
     * @param id - The id of the item to resolve.
     * @returns The id of the root ancestor, or `undefined` if the item does not exist.
     */
    getRoot(id: Id): Id | undefined;
    /**
     * Parses and loads data into the collection.
     * For PERT diagrams, accepts a {@link IPertData} object with separate `data` and `links` arrays
     * and automatically transforms them into the internal format. Detects circular dependencies
     * and filters invalid links before loading.
     * @param data - An array of item configs, a {@link IPertData} object, or a JSON string.
     * @param driver - Optional custom data driver for parsing.
     * @returns A promise that resolves when parsing is complete.
     * @example
     * ```ts
     * // Parse flat data
     * diagram.data.parse([
     *     { id: "1", type: "rectangle", x: 100, y: 100 },
     *     { id: "2", type: "circle", x: 300, y: 100 },
     *     { id: "l1", type: "line", from: "1", to: "2" },
     * ]);
     *
     * // Parse PERT data
     * diagram.data.parse({
     *     data: [{ id: "task_1", type: "task", text: "Task 1" }],
     *     links: [{ source: "task_1", target: "task_2", type: "0" }],
     * });
     * ```
     */
    parse(data: IDataItem[] | IPertData | string, driver?: DataDriver | IDataDriver): Promise<any>;
    /**
     * Serializes the collection data into a plain array of item configs.
     * Strips all internal `$`-prefixed properties from the output.
     * For PERT diagrams, returns a {@link IPertData} object with separate `data` and `links` arrays.
     * @returns A serialized array of item configs, or an {@link IPertData} object for PERT diagrams.
     */
    serialize(): IDataItem[] | IPertData;
    private _initEvents;
    private _handleDataChange;
    private _handleDefaultDiagramChange;
    private _handleHierarchicalDiagramChange;
    protected _serialize(data: IDataItem[]): IDataItem[];
    protected _parse_data(data: IDataItem[]): void;
    protected _mark_chains(): void;
    private _buildRelationshipMaps;
    private _applyRelationships;
    private _applyDefaultRelationships;
    private _applyHierarchicalRelationships;
    private _updateHierarchicalProperties;
    private _mapDefaultVisible;
    private _mapHierarchicalVisible;
    protected _eachBranch(item: ItemConfig, handler: (item: IDataItem) => any, stack: any[]): void;
    protected _removeNested(item: IDataItem): void;
    protected _setBranchLevel(item: IDataItem, level?: number): void;
    protected _setLineLevel(line: IDataItem, from?: IDataItem, to?: IDataItem): void;
    private _getDirectChildren;
    private _setGroupChildren;
    private _removeGroupChildren;
    private _setGroupVisible;
    private _checkSwimlaneCells;
    private _parse_pert_data;
    private _serialize_pert_data;
    private _isPertData;
    private _removeDefaultProps;
}
export {};
