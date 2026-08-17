import { IEventSystem } from "../../ts-common/events";
import { Id, SelectionEvents } from "../../ts-common/types";
import { DataEvents, IDataItem } from "../../ts-data";
import { Diagram, DiagramEvents, DiagramType, IAutoPlacement, IBaseCoords, IShapeToolbarConfig, ILineRenderConfig, IDefaultShapeConfig } from "../../ts-diagram";
import { HistoryManager } from "./helpers/HistoryManager";
import { CopyManager } from "./helpers/CopyManager";
import { Editbar, Toolbar, View } from "./view";
import { ViewConfig } from "./view/View";
import { TShapeSections } from "./view/Shapebar";
/** The main Diagram Editor widget instance interface. */
export interface IDiagramEditor {
    /** The current version string of the Diagram Editor library. */
    version: string;
    /** The active configuration object of the editor. */
    config: IDefaultEditorConfig | IOrgEditorConfig | IMindmapEditorConfig | IEditorConfig;
    /** The event system for subscribing to data, selection, diagram, and editor events. */
    events: IEventSystem<DataEvents | SelectionEvents | DiagramEvents | DiagramEditorEvents, IDiagramEditorHandlersMap>;
    /** The view manager that controls toolbar, shapebar, and editbar panels. */
    view: View;
    /** The editor toolbar component. */
    toolbar: Toolbar;
    /** The property editor (editbar) component. */
    editbar: Editbar;
    /** The underlying Diagram instance managed by the editor. */
    diagram: Diagram;
    /** The undo/redo history manager. */
    history: HistoryManager;
    /** The copy/paste manager. */
    model: CopyManager;
    /** Re-renders the editor and its diagram. */
    paint(): void;
    /** Destroys the editor instance and releases resources. */
    destructor(): void;
    /**
     * Imports data from an external Diagram instance into the editor.
     * @param diagram - The source Diagram to import from.
     */
    import(diagram: Diagram): void;
    /**
     * Parses an array of data items into the editor's diagram.
     * @param data - The array of item configurations to load.
     */
    parse(data: IDataItem[]): void;
    /** Serializes the editor's diagram data into an array of data items. */
    serialize(): IDataItem[];
    /**
     * Zooms in the diagram canvas.
     * @param step - The zoom increment (optional).
     */
    zoomIn(step?: number): void;
    /**
     * Zooms out the diagram canvas.
     * @param step - The zoom decrement (optional).
     */
    zoomOut(step?: number): void;
}
/** Built-in toolbar button identifiers for org chart editor mode. */
export type OrgToolbarTypes = "add" | "horizontal" | "vertical" | "remove";
/** Built-in toolbar button identifiers for mind map editor mode. */
export type MindmapToolbarTypes = "add" | "addLeft" | "addRight" | "remove";
/** Built-in toolbar button identifiers for radial tree editor mode. */
export type RadialToolbarTypes = "add" | "remove";
/** Built-in toolbar button identifiers for default (flowchart) editor mode. */
export type DefaultToolbarTypes = "copy" | "connect" | "removePoint" | "remove";
/** Toolbar configuration type for shapes in org chart editor mode. */
export type OrgShapeToolbar = IShapeToolbarConfig[] | OrgToolbarTypes[] | boolean[] | (IShapeToolbarConfig | OrgToolbarTypes | boolean)[];
/** Toolbar configuration type for shapes in mind map editor mode. */
export type MindmapShapeToolbar = IShapeToolbarConfig[] | MindmapToolbarTypes[] | boolean[] | (IShapeToolbarConfig | MindmapToolbarTypes | boolean)[];
/** Toolbar configuration type for shapes in radial tree editor mode. */
export type RadialShapeToolbar = IShapeToolbarConfig[] | RadialToolbarTypes[] | boolean[] | (IShapeToolbarConfig | RadialToolbarTypes | boolean)[];
/** Toolbar configuration type for shapes in default (flowchart) editor mode. */
export type DefaultShapeToolbar = IShapeToolbarConfig[] | DefaultToolbarTypes[] | boolean[] | (IShapeToolbarConfig | DefaultToolbarTypes | boolean)[];
/** Base configuration object passed to the Diagram Editor constructor. */
export interface IEditorConfig {
    /** The diagram layout mode for the editor. */
    type?: DiagramType;
    /** The default shape type used when adding new shapes from the shapebar. */
    shapeType?: string;
    /** Configuration for the editor's view panels (toolbar, shapebar, editbar). */
    view?: ViewConfig;
    /** A map of shape type names to their default configuration objects. */
    defaults?: IDefaultShapeConfig;
    /** Global default settings for line rendering. */
    lineConfig?: ILineRenderConfig;
    /**
     * The initial zoom scale factor.
     * @default 1
     */
    scale?: number;
    /**
     * Whether to show the background grid.
     * @default false
     */
    grid?: boolean;
    /**
     * The size of the grid step in pixels.
     * @default 10
     */
    gridStep?: number;
    /**
     * Whether to show resize handles on selected items.
     * @default true
     */
    resizePoints?: boolean;
    /**
     * Keyboard shortcut configuration.
     * Set to `false` to disable all hotkeys, or provide a map of hotkey overrides.
     */
    hotkeys?: boolean | {
        [key: string]: false | ((event: KeyboardEvent) => void);
    };
    /**
     * @deprecated since v5.0. The editor mode is now determined by the {@link IEditorConfig.type} property.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    editMode?: boolean;
    /**
     * @deprecated since v5.0. Use {@link ILineRenderConfig.lineGap} via the {@link IEditorConfig.lineConfig} property instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    lineGap?: number;
    /**
     * @deprecated since v5.0. Use the {@link IEditorConfig.view} property to configure toolbar, shapebar, and editbar.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    controls?: IEditorControls;
    /**
     * @deprecated since v5.0. Use the view configuration to control panel widths.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    reservedWidth?: number;
}
/** Editor configuration specific to org chart mode. */
export interface IOrgEditorConfig extends IEditorConfig {
    /** The diagram mode discriminator, always `"org"`. */
    type: "org";
    /** Shape toolbar configuration. Set to `false` to hide, or provide custom toolbar items. */
    shapeToolbar?: boolean | OrgShapeToolbar;
    /**
     * Whether items can be dragged to rearrange the hierarchy.
     * @default true
     */
    itemsDraggable?: boolean;
    /** View configuration (shapebar is not available in org chart mode). */
    view?: Omit<ViewConfig, "shapebar">;
}
/** Editor configuration specific to mind map mode. */
export interface IMindmapEditorConfig extends IEditorConfig {
    /** The diagram mode discriminator, always `"mindmap"`. */
    type: "mindmap";
    /** Shape toolbar configuration. Set to `false` to hide, or provide custom toolbar items. */
    shapeToolbar?: boolean | MindmapShapeToolbar;
    /**
     * Whether items can be dragged to rearrange the hierarchy.
     * @default true
     */
    itemsDraggable?: boolean;
    /** View configuration (shapebar is not available in mind map mode). */
    view?: Omit<ViewConfig, "shapebar">;
}
/** Editor configuration specific to default (flowchart) mode. */
export interface IDefaultEditorConfig extends IEditorConfig {
    /** The diagram mode discriminator, always `"default"`. */
    type: "default";
    /** Shape toolbar configuration. Set to `false` to hide, or provide custom toolbar items. */
    shapeToolbar?: boolean | DefaultShapeToolbar;
    /** Configuration for the automatic layout algorithm. */
    autoplacement?: IAutoPlacement;
    /** Magnetic guide line configuration. Set to `true` for defaults, or provide a config object. */
    magnetic?: boolean | IMagneticConfig;
    /**
     * Whether to show connection points on shapes for drawing lines.
     * @default true
     */
    connectionPoints?: boolean;
    /**
     * @deprecated since v5.0. Use `view.shapebar.width` instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    shapeBarWidth?: number;
    /**
     * @deprecated since v5.0. Use `view.shapebar.sections` instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    shapeSections?: TShapeSections;
    /**
     * @deprecated since v5.0. Use `view.shapebar.preview.gap` instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    gapPreview?: string | number;
    /**
     * @deprecated since v5.0. Use `view.shapebar.preview.scale` instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    scalePreview?: string | number;
}
/** Describes a potential drop target during item drag operations. */
export interface ITargetOption {
    /** The currently selected data item, or `null` if no target. */
    selected: IDataItem | null;
    /** An item id to exclude from target detection. */
    exclude?: Id | null;
    /** The coordinates of the drag pointer. */
    coord?: IBaseCoords;
}
/** Configuration for magnetic guide lines shown during item movement. */
export interface IMagneticConfig {
    /**
     * Whether magnetic guide lines are enabled.
     * @default true
     */
    show?: boolean;
    /** The width of the magnetic guide line in pixels. */
    lineWidth?: number;
    /** The color of the magnetic guide line. */
    lineColor?: string;
}
/** Represents the start and end coordinates of a rectangular selection area. */
export interface ISelectionBox {
    /** The starting corner of the selection rectangle. */
    start: ICoords;
    /** The ending corner of the selection rectangle. */
    end: ICoords;
}
/** A basic x/y coordinate pair used within the editor context. */
export interface ICoords {
    /** The horizontal position. */
    x: number;
    /** The vertical position. */
    y: number;
}
/** A key-value map of serializable property values for data diffing. */
export interface IDataHash {
    [id: string]: string | number | boolean;
}
/** Event payload for line title move events. */
export interface ILineTitleMoveEvent {
    /** The id of the line that owns the title. */
    id: Id;
    /** The id of the title being moved. */
    titleId: Id;
    /** The current coordinates of the title. */
    coords: IBaseCoords;
    /** The original pointer event that triggered the move. */
    event: PointerEvent;
}
/** Event payload for item target/catch events during drag. */
export interface IItemTargetEvent {
    /** The id of the item being dragged. */
    id: Id;
    /** The id of the drop target item. */
    targetId: Id;
    /** Array of ids in the current drag batch. */
    batch: Id[];
    /** The original pointer event that triggered the action. */
    event: PointerEvent;
}
/** Event payload for item move events (shapes, groups). */
export interface IItemMoveEvent {
    /** The id of the item being moved. */
    id: Id;
    /** Array of ids in the current drag batch. */
    batch: Id[];
    /** The current coordinates of the item. */
    coords: IBaseCoords;
    /** The original pointer event that triggered the move. */
    event: PointerEvent;
    /** @internal The movement delta. */
    $mov?: ICoords;
}
/** Event payload for item rotation events. */
export interface IItemAngleEvent {
    /** The id of the item being rotated. */
    id: Id;
    /** The current rotation angle in degrees. */
    angle: number;
}
/** Event payload for item resize events. */
export interface IItemResizeEvent {
    /** The id of the item being resized. */
    id: Id;
    /** The new width of the item. */
    width: number;
    /** The new height of the item. */
    height: number;
    /** The new x-position of the item. */
    x: number;
    /** The new y-position of the item. */
    y: number;
    /** The resize handle direction (compass point). */
    dir: "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
}
/** Enumeration of all events fired by the Diagram Editor. */
export declare enum DiagramEditorEvents {
    /** Fired when the user zooms in. */
    zoomIn = "zoomin",
    /** Fired when the user zooms out. */
    zoomOut = "zoomout",
    /** Fired before a shape toolbar icon is clicked. Return `false` to prevent. */
    beforeShapeIconClick = "beforeShapeIconClick",
    /** Fired after a shape toolbar icon is clicked. */
    afterShapeIconClick = "afterShapeIconClick",
    /** Fired before a line title starts moving. Return `false` to prevent. */
    beforeLineTitleMove = "beforeLineTitleMove",
    /** Fired continuously as a line title is being moved. */
    afterLineTitleMove = "afterLineTitleMove",
    /** Fired when a line title move operation ends. */
    lineTitleMoveEnd = "lineTitleMoveEnd",
    /** Fired before a shape starts moving. Return `false` to prevent. */
    beforeShapeMove = "beforeShapeMove",
    /** Fired continuously as a shape is being moved. */
    afterShapeMove = "afterShapeMove",
    /** Fired when a shape move operation ends. */
    shapeMoveEnd = "shapeMoveEnd",
    /** Fired before a group starts moving. Return `false` to prevent. */
    beforeGroupMove = "beforeGroupMove",
    /** Fired continuously as a group is being moved. */
    afterGroupMove = "afterGroupMove",
    /** Fired when a group move operation ends. */
    groupMoveEnd = "groupMoveEnd",
    /** Fired before any item starts moving. Return `false` to prevent. */
    beforeItemMove = "beforeItemMove",
    /** Fired continuously as any item is being moved. */
    afterItemMove = "afterItemMove",
    /** Fired when any item move operation ends. */
    itemMoveEnd = "itemMoveEnd",
    /** Fired before an item starts being resized. Return `false` to prevent. */
    beforeItemResize = "beforeItemResize",
    /** Fired continuously as an item is being resized. */
    afterItemResize = "afterItemResize",
    /** Fired when an item resize operation ends. */
    itemResizeEnd = "itemResizeEnd",
    /** Fired before an item starts being rotated. Return `false` to prevent. */
    beforeItemRotate = "beforeItemRotate",
    /** Fired continuously as an item is being rotated. */
    afterItemRotate = "afterItemRotate",
    /** Fired when an item rotation operation ends. */
    itemRotateEnd = "itemRotateEnd",
    /** Fired when a dragged item is over a potential drop target. Return `false` to prevent. */
    itemTarget = "itemTarget",
    /** Fired before an item is caught (dropped into) a group. Return `false` to prevent. */
    beforeItemCatch = "beforeItemCatch",
    /** Fired after an item is caught (dropped into) a group. */
    afterItemCatch = "afterItemCatch",
    /**
     * @deprecated since v5.0. Use {@link DiagramEditorEvents.beforeShapeMove} / {@link DiagramEditorEvents.afterShapeMove} instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    shapeMove = "shapemove",
    /**
     * @deprecated since v5.0. The reset button was removed. Use the toolbar view API instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    resetButton = "resetButton",
    /**
     * @deprecated since v5.0. The apply button was removed. Use the toolbar view API instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    applyButton = "applyButton",
    /**
     * @deprecated since v5.0. Use the history manager API instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    undoButton = "undoButton",
    /**
     * @deprecated since v5.0. Use the history manager API instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    redoButton = "redoButton",
    /**
     * @deprecated since v5.0. Use the view API (`view.show()` / `view.hide()`) instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    visibility = "visibility",
    /**
     * @deprecated since v5.0. Use `editor.serialize()` instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    exportData = "exportData",
    /**
     * @deprecated since v5.0. Use `editor.import()` or `editor.parse()` instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    importData = "importData",
    /**
     * @deprecated since v5.0. Use `editor.diagram.autoPlace()` instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    autoLayout = "autoLayout",
    /**
     * @deprecated since v5.0. Use the editor config `gridStep` property instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    changeGridStep = "changeGridStep",
    /**
     * @deprecated since v5.0. Use {@link DiagramEditorEvents.beforeItemResize} / {@link DiagramEditorEvents.afterItemResize} instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    shapeResize = "shapeResize",
    /** @internal System event fired when a shape is released from the shapebar. */
    shapesUp = "shapesUp"
}
/** Maps each {@link DiagramEditorEvents} member to its handler function signature. */
export interface IDiagramEditorHandlersMap {
    /** Index signature required for TypeScript compatibility with computed property keys. */
    [key: string]: (...args: any[]) => any;
    [DiagramEditorEvents.zoomIn]: (step: number) => void;
    [DiagramEditorEvents.zoomOut]: (step: number) => void;
    [DiagramEditorEvents.beforeShapeIconClick]: (iconId: string, shape: IDataItem) => boolean | void;
    [DiagramEditorEvents.afterShapeIconClick]: (iconId: string, shape: IDataItem) => void;
    [DiagramEditorEvents.beforeLineTitleMove]: (obj: ILineTitleMoveEvent) => boolean | void;
    [DiagramEditorEvents.afterLineTitleMove]: (obj: ILineTitleMoveEvent) => void;
    [DiagramEditorEvents.lineTitleMoveEnd]: (obj: ILineTitleMoveEvent) => void;
    [DiagramEditorEvents.beforeShapeMove]: (obj: IItemMoveEvent) => boolean | void;
    [DiagramEditorEvents.afterShapeMove]: (obj: IItemMoveEvent) => void;
    [DiagramEditorEvents.shapeMoveEnd]: (obj: IItemMoveEvent) => void;
    [DiagramEditorEvents.beforeGroupMove]: (obj: IItemMoveEvent) => boolean | void;
    [DiagramEditorEvents.afterGroupMove]: (obj: IItemMoveEvent) => void;
    [DiagramEditorEvents.groupMoveEnd]: (obj: IItemMoveEvent) => void;
    [DiagramEditorEvents.beforeItemMove]: (obj: IItemMoveEvent) => boolean | void;
    [DiagramEditorEvents.afterItemMove]: (obj: IItemMoveEvent) => void;
    [DiagramEditorEvents.itemMoveEnd]: (obj: IItemMoveEvent) => void;
    [DiagramEditorEvents.itemTarget]: (obj: IItemTargetEvent) => boolean | void;
    [DiagramEditorEvents.beforeItemCatch]: (obj: IItemTargetEvent) => boolean | void;
    [DiagramEditorEvents.afterItemCatch]: (obj: IItemTargetEvent) => void;
    [DiagramEditorEvents.beforeItemResize]: (obj: IItemResizeEvent) => boolean | void;
    [DiagramEditorEvents.afterItemResize]: (obj: IItemResizeEvent) => void;
    [DiagramEditorEvents.itemResizeEnd]: (obj: IItemResizeEvent) => void;
    [DiagramEditorEvents.beforeItemRotate]: (obj: IItemAngleEvent) => boolean | void;
    [DiagramEditorEvents.afterItemRotate]: (obj: IItemAngleEvent) => void;
    [DiagramEditorEvents.itemRotateEnd]: (obj: IItemAngleEvent) => void;
    [DiagramEditorEvents.shapeMove]: () => void;
    [DiagramEditorEvents.resetButton]: () => void;
    [DiagramEditorEvents.applyButton]: () => void;
    [DiagramEditorEvents.undoButton]: () => void;
    [DiagramEditorEvents.redoButton]: () => void;
    [DiagramEditorEvents.visibility]: () => void;
    [DiagramEditorEvents.exportData]: () => void;
    [DiagramEditorEvents.importData]: (data: IDataItem[]) => void;
    [DiagramEditorEvents.changeGridStep]: (step: number) => void;
    [DiagramEditorEvents.shapeResize]: () => void;
    /** @internal System event handler for shapebar shape release. */
    [DiagramEditorEvents.shapesUp]: (shape: IDataItem) => void;
}
/**
 * @deprecated since v5.0. Entire interface is deprecated. Configure toolbar via the `view` property of the editor config.
 * See https://docs.dhtmlx.com/diagram/migration/
 */
export interface IEditorControls {
    /** Whether to show the apply button. */
    apply?: boolean;
    /** Whether to show the reset button. */
    reset?: boolean;
    /** Whether to show the export button. */
    export?: boolean;
    /** Whether to show the import button. */
    import?: boolean;
    /** Whether to show the auto-layout button. */
    autoLayout?: boolean;
    /** Whether to enable the undo/redo history manager. */
    historyManager?: boolean;
    /** Whether to enable the inline text editor. */
    editManager?: boolean;
    /** Whether to show the zoom scale control. */
    scale?: boolean;
    /** Whether to show the grid step control. */
    gridStep?: boolean;
}
