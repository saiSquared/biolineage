export { SelectionEvents } from "../../ts-common/types";
export { DataEvents } from "../../ts-data";
import { VNode } from "../../ts-common/dom";
import { IEventSystem } from "../../ts-common/events";
import { Id, ISelectionEventsHandlersMap, SelectionEvents } from "../../ts-common/types";
import { DataEvents, IDataItem } from "../../ts-data";
import { Line } from "./components/Lines/Line";
import { LineTitle } from "./components/Lines/LineTitle";
import { CellManager, CellManagerEvents, ICellManagerHandlersMap } from "./modules/CellManager";
import { Editor, EditorEvents } from "./modules/Editor";
import { Exporter } from "./modules/Export";
import { Selection } from "./modules/Selection";
import { ShapesCollection } from "./modules/ShapesCollection";
import { Toolbar } from "./modules/Toolbar";
/** Supported diagram layout modes. */
export type DiagramType = "default" | "org" | "mindmap" | "pert";
/** The role of an item within the diagram data model. */
export type Role = "shape" | "line" | "lineTitle" | "group" | "swimlane";
/** Cardinal directions used for positioning headers and elements. */
export type BaseDirection = "top" | "bottom" | "left" | "right";
/** Directions for keyboard-driven item movement. */
export type ActionDirection = "up" | "down" | "left" | "right";
/** Horizontal direction for tree branch expansion. */
export type TreeDirection = "right" | "left";
/** Swimlane cell axis type: row or column. */
export type ICellType = "row" | "col";
/** Types of user actions that can be validated. */
export type ActionValidate = "move" | "remove" | "add";
/** Horizontal text alignment within a shape or header. */
export type TextAlign = "left" | "center" | "right";
/** Vertical text alignment within a shape or header. */
export type TextVerticalAlign = "top" | "center" | "bottom";
/** CSS font-style values supported for text rendering. */
export type FontStyle = "normal" | "italic" | "oblique";
/**
 * The side of a shape where a line connects.
 * Accepts cardinal directions, `"center"`, or a custom string identifier.
 */
export type LineShapeSide = BaseDirection | "center" | string;
/** The rendering direction of a line in org/mindmap modes. */
export type LineDirection = "vertical" | "verticalLeft" | "verticalRight";
/** Visual style of a line stroke. */
export type TLineType = "line" | "dash" | "none";
/** Arrow head visibility on a line endpoint. */
export type Arrows = "filled" | "none";
/** Identifies which end of a line carries an arrow. */
export type ArrowType = "forwardArrow" | "backArrow";
/**
 * Routing algorithm for connector lines between shapes.
 * @remarks `"flex"` is reserved and currently unused.
 */
export type ConnectType = "straight" | "flex" | "elbow" | "curved";
/** Named anchor point on a shape for line attachment. */
export type ConnectSide = "center" | "left" | "right" | "top" | "bottom";
/** A basic x/y coordinate pair. */
export interface IBaseCoords {
    /** The horizontal position. */
    x: number;
    /** The vertical position. */
    y: number;
}
/** Extended coordinate pair with optional side annotation and rendering offsets. */
export interface ICoords extends IBaseCoords {
    /** The side of a shape this coordinate is associated with. */
    side?: string;
    /** Whether this coordinate was manually set by the user. */
    custom?: boolean;
    /** @internal Rendering x-offset. */
    $rx?: number;
    /** @internal Rendering y-offset. */
    $ry?: number;
}
/**
 * Configuration for the shape preview thumbnail shown in the shapebar.
 */
export interface IPreview {
    /** URL or path to a custom preview image. */
    img?: string;
    /** Scale factor for the preview rendering. */
    scale?: number;
    /** Width of the preview container. */
    width?: number | string;
    /** Height of the preview container. */
    height?: number | string;
    /** Gap (margin) around the preview element. */
    gap?: number | string;
}
/** A positioned rectangle used for hit-testing (locate). */
export interface IMeasuredItem extends IBaseCoords {
    /** The width of the measured area. */
    width: number;
    /** The height of the measured area. */
    height: number;
}
/** Bounding box expressed as edge positions. */
export interface IBoxSize {
    /** The left edge position. */
    left: number;
    /** The right edge position. */
    right: number;
    /** The top edge position. */
    top: number;
    /** The bottom edge position. */
    bottom: number;
}
/** The computed content area dimensions and scroll offset of the diagram canvas. */
export interface IContentSize {
    /** The total content width. */
    x: number;
    /** The total content height. */
    y: number;
    /** The horizontal scroll offset. */
    left: number;
    /** The vertical scroll offset. */
    top: number;
    /** The current scale (zoom) factor. */
    scale: number;
}
/** The main Diagram widget instance interface. */
export interface IDiagram {
    /** The current version string of the Diagram library. */
    version: string;
    /** The active configuration object of the diagram. */
    config: IDiagramConfig;
    /** The event system for subscribing to diagram, data, selection, and cell manager events. */
    events: IEventSystem<DataEvents | SelectionEvents | DiagramEvents | EditorEvents | CellManagerEvents, IDiagramEventHandlersMap | ICellManagerHandlersMap | ISelectionEventsHandlersMap>;
    /** The shapes data collection. */
    data: ShapesCollection;
    /** The selection manager module. */
    selection: Selection;
    /** The cell manager module for swimlane cell operations. */
    cellManager: CellManager;
    /** The export module for PDF/PNG export. */
    export: Exporter;
    /** The shape toolbar module. */
    toolbar: Toolbar;
    /** The inline text editor module. */
    editor: Editor;
    /** Re-renders the diagram. */
    paint(): void;
    /** Destroys the diagram instance and releases resources. */
    destructor(): void;
    /** Returns the shape located at the given DOM event position. */
    locate(event: Event): IBaseShape;
    /**
     * Collapses a tree branch starting from the specified item.
     * @param id - The id of the item to collapse.
     * @param dir - The direction of the branch to collapse (for mindmap mode).
     */
    collapseItem(id: Id, dir?: TreeDirection): void;
    /**
     * Expands a tree branch starting from the specified item.
     * @param id - The id of the item to expand.
     * @param dir - The direction of the branch to expand (for mindmap mode).
     */
    expandItem(id: Id, dir?: TreeDirection): void;
    /** Returns the current scroll position of the diagram canvas. */
    getScrollState(): ICoords;
    /**
     * Scrolls the diagram canvas to the specified coordinates.
     * @param x - The horizontal scroll position.
     * @param y - The vertical scroll position.
     */
    scrollTo(x: number, y: number): void;
    /**
     * Scrolls the diagram to make the specified item visible.
     * @param id - The id of the item to scroll to.
     */
    showItem(id: Id): void;
    /**
     * Registers a custom shape type.
     * @param type - The unique name for the custom shape type.
     * @param parameters - The custom shape definition (template, defaults, event handlers).
     */
    addShape(type: string, parameters: ICustomShapeParam): void;
    /**
     * Automatically arranges items on the diagram canvas using a layout algorithm.
     * @param config - Optional auto-placement configuration.
     */
    autoPlace(config?: IAutoPlacement): void;
}
export interface IDiagramConfig {
    /**
     * The diagram layout mode.
     * @default "default"
     */
    type?: DiagramType;
    /** Mode-specific configuration for mindmap or PERT chart layouts. */
    typeConfig?: IMindMapConfig | IPertChartConfig;
    /** Global default settings for line rendering. */
    lineConfig?: ILineRenderConfig;
    /** A map of shape type names to their default configuration objects. */
    defaults?: IDefaultShapeConfig;
    /** The default shape type used when adding new shapes. */
    defaultShapeType?: string;
    /** Padding/margin around the diagram canvas and between items. */
    margin?: IMarginConfig;
    /**
     * Whether items can be selected by clicking.
     * @default true
     */
    select?: boolean;
    /**
     * Whether the diagram canvas is scrollable.
     * @default true
     */
    scroll?: boolean;
    /**
     * The initial zoom scale factor.
     * @default 1
     */
    scale?: number;
    /**
     * The size of the grid step in pixels.
     * @default 10
     */
    gridStep?: number;
    /** Configuration for shape toolbar buttons displayed on selected shapes. */
    toolbar?: IShapeToolbarConfig[];
    /** Configuration for the automatic layout algorithm. */
    autoplacement?: IAutoPlacement;
    /**
     * Whether to include CSS styles when exporting. Pass an array of CSS URLs for custom styles.
     * @default true
     */
    exportStyles?: boolean | string[];
    /** @internal Callback injected by the editor to render overlay SVG elements. */
    $svg?: (size: IContentSize) => VNode | VNode[] | null;
    /** @internal Callback injected by the editor to check grid visibility. */
    $grid?: () => boolean;
    /** @internal Whether the diagram is running inside the editor. */
    $isEditor?: boolean;
    /**
     * @deprecated since v5.0. Use {@link ILineRenderConfig.lineType} via the {@link IDiagramConfig.lineConfig} property instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    defaultLinkType?: TLineType;
    /**
     * @deprecated since v5.0. Use {@link ILineRenderConfig.lineGap} via the {@link IDiagramConfig.lineConfig} property instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    lineGap?: number;
}
/** Layout configuration specific to PERT chart mode. */
export interface IPertChartConfig {
    /** Vertical spacing between PERT chart items in pixels. */
    vSpacing?: number;
    /** Horizontal spacing between PERT chart items in pixels. */
    hSpacing?: number;
    /** Vertical padding within a PERT chart group in pixels. */
    vPadding?: number;
    /** Horizontal padding within a PERT chart group in pixels. */
    hPadding?: number;
    /** The date format string used for parsing task dates. */
    dateFormat?: string;
}
/** Layout configuration specific to mind map mode. */
export interface IMindMapConfig {
    /** The default branch direction for child items. */
    direction?: "left" | "right";
    /** Explicit assignment of child item ids to left or right sides. */
    side?: {
        /** Array of item ids to place on the left side. */
        left?: string[];
        /** Array of item ids to place on the right side. */
        right?: string[];
    };
}
/** Global default settings for line rendering. */
export interface ILineRenderConfig {
    /** The visual style of the line stroke. */
    lineType?: TLineType;
    /** Whether to hide arrow heads on lines. */
    arrowsHidden?: boolean;
    /** Which end of the line carries an arrow. */
    lineDirection?: ArrowType;
    /** The gap between parallel lines in pixels. */
    lineGap?: number;
    /** The routing algorithm for connector lines. */
    connectType?: ConnectType;
}
/** A map of shape type names to their default configuration objects. */
export interface IDefaultShapeConfig {
    [type: string]: ShapeConfig;
}
/** Padding/margin configuration for the diagram canvas and items. */
export interface IMarginConfig {
    /** Horizontal margin of the diagram canvas in pixels. */
    x?: number;
    /** Vertical margin of the diagram canvas in pixels. */
    y?: number;
    /** Horizontal spacing between items in pixels. */
    itemX?: number;
    /** Vertical spacing between items in pixels. */
    itemY?: number;
}
export interface IShapeToolbarConfig {
    /** The HTML content or VNode to render inside the button. */
    content: string | VNode;
    /** The unique identifier of the toolbar button. */
    id: string;
    /** A function that determines whether this button is visible for a given item. */
    check?: (item: IDataItem) => boolean;
    /** A function that returns a CSS class string for the button based on the item. */
    css?: (item: IDataItem) => string;
    /** The tooltip text displayed on hover. */
    tooltip?: string;
}
/**
 * Configuration for the automatic layout algorithm.
 * @example
 * ```ts
 * diagram.autoPlace({
 *     mode: "edges",
 *     placeMode: "orthogonal",
 *     itemPadding: 50,
 *     levelPadding: 100,
 *     graphPadding: 200,
 * });
 * ```
 */
export interface IAutoPlacement {
    /** The id of the root item from which to start the layout. */
    root: Id;
    /**
     * The algorithm mode for determining hierarchy.
     * @default "direct"
     */
    mode?: "direct" | "edges";
    /**
     * The placement style for arranging items.
     * @default "orthogonal"
     */
    placeMode?: "orthogonal" | "radial";
    /** Padding between items in pixels. */
    itemPadding?: number;
    /** Padding between hierarchy levels in pixels. */
    levelPadding?: number;
    /** Padding between disconnected graphs in pixels. */
    graphPadding?: number;
    /** The direction for wide layouts. */
    wide?: string;
    /** The overall layout direction. */
    direction?: string;
}
/**
 * Parameters for registering a custom shape type via `addShape()`.
 * @example
 * ```ts
 * diagram.addShape("custom-card", {
 *     template: (config) => `
 *         <section class="custom-card">
 *             <h3>${config.title}</h3>
 *             <p>${config.text}</p>
 *         </section>
 *     `,
 *     defaults: { width: 200, height: 120, title: "Title", text: "" },
 *     eventHandlers: {
 *         onclick: {
 *             "custom-card": (event, item) => {
 *                 console.log("Clicked:", item.id);
 *             },
 *         },
 *     },
 * });
 * ```
 */
export interface ICustomShapeParam {
    /** Default property values for shapes of this custom type. */
    defaults?: ICustomShapeConfig;
    /** A function that returns an SVG/HTML template string for the shape. */
    template: (config: ICustomShapeConfig) => string;
    /**
     * A map of DOM event names to CSS-class-based handler functions for custom shape interactivity.
     *
     * The outer key is a DOM event name (e.g., `"onclick"`, `"onmouseover"`).
     * The inner key is a CSS class name; the handler fires when the event target matches that class.
     */
    eventHandlers?: {
        [eventName: string]: {
            [cssClass: string]: (event: Event, item: IDataItem) => boolean | void;
        };
    };
}
/** Enumeration of all events fired by the Diagram widget. */
export declare enum DiagramEvents {
    /** Fired when the diagram canvas is scrolled. */
    scroll = "scroll",
    /** Fired before the diagram is rendered. */
    beforeRender = "beforerender",
    /** Fired on a click in an empty area of the canvas. */
    emptyAreaClick = "emptyAreaClick",
    /** Fired on a double-click in an empty area of the canvas. */
    emptyAreaDblClick = "emptyAreaDblClick",
    /** Fired on a mouse-down in an empty area of the canvas. */
    emptyAreaMouseDown = "emptyAreaMouseDown",
    /** Fired before a sub-header context menu opens. */
    beforeSubmenuOpen = "beforeSubmenuOpen",
    /** Fired after a sub-header context menu opens. */
    afterSubmenuOpen = "afterSubmenuOpen",
    /** Fired before a tree branch is collapsed. Return `false` to prevent. */
    beforeCollapse = "beforeCollapse",
    /** Fired after a tree branch is collapsed. */
    afterCollapse = "afterCollapse",
    /** Fired before a tree branch is expanded. Return `false` to prevent. */
    beforeExpand = "beforeExpand",
    /** Fired after a tree branch is expanded. */
    afterExpand = "afterExpand",
    /** Fired on a mouse-down on a shape. */
    shapeMouseDown = "shapeMouseDown",
    /** Fired on a click on a shape. */
    shapeClick = "shapeClick",
    /** Fired on a double-click on a shape. */
    shapeDblClick = "shapeDblClick",
    /** Fired on a click on a shape toolbar icon. */
    shapeIconClick = "shapeIconClick",
    /** Fired on a mouse-down on a connector line. */
    lineMouseDown = "lineMouseDown",
    /** Fired on a click on a connector line. */
    lineClick = "lineClick",
    /** Fired on a double-click on a connector line. */
    lineDblClick = "lineDblClick",
    /** Fired on a mouse-down on a line title. */
    lineTitleMouseDown = "lineTitleMouseDown",
    /** Fired on a click on a line title. */
    lineTitleClick = "lineTitleClick",
    /** Fired on a double-click on a line title. */
    lineTitleDblClick = "lineTitleDblClick",
    /** Fired on a mouse-down on a group container. */
    groupMouseDown = "groupMouseDown",
    /** Fired on a click on a group container. */
    groupClick = "groupClick",
    /** Fired on a double-click on a group container. */
    groupDblClick = "groupDblClick",
    /** Fired on a click on a group header. */
    groupHeaderClick = "groupHeaderClick",
    /** Fired on a double-click on a group header. */
    groupHeaderDblClick = "groupHeaderDblClick",
    /** Fired on a mouse-down on any item (shape, line, or group). */
    itemMouseDown = "itemMouseDown",
    /** Fired on a click on any item. */
    itemClick = "itemClick",
    /** Fired on a double-click on any item. */
    itemDblClick = "itemDblClick",
    /** Fired when the mouse pointer enters any item. */
    itemMouseOver = "itemMouseOver",
    /** Fired when the mouse pointer leaves any item. */
    itemMouseOut = "itemMouseOut",
    /**
     * @deprecated since v5.0. Use {@link DiagramEvents.itemMouseOver} and {@link DiagramEvents.itemMouseOut} instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    shapeHover = "shapeHover"
}
/** Maps each {@link DiagramEvents} member to its handler function signature. */
export interface IDiagramEventHandlersMap {
    /** Index signature required for TypeScript compatibility with computed property keys. */
    [key: string]: (...args: any[]) => any;
    [DiagramEvents.scroll]: (position: ICoords) => void;
    [DiagramEvents.beforeRender]: (size: IContentSize) => void;
    [DiagramEvents.emptyAreaClick]: (event: MouseEvent) => void;
    [DiagramEvents.emptyAreaDblClick]: (event: MouseEvent) => void;
    [DiagramEvents.emptyAreaMouseDown]: (event: MouseEvent) => void;
    [DiagramEvents.shapeIconClick]: (id: string, event: MouseEvent) => void;
    [DiagramEvents.beforeSubmenuOpen]: (id: Id, event: MouseEvent, subHeaderId?: string) => boolean | void;
    [DiagramEvents.afterSubmenuOpen]: (id: Id, event: MouseEvent, subHeaderId?: string) => void;
    [DiagramEvents.beforeCollapse]: (id: Id, dir?: TreeDirection) => boolean | void;
    [DiagramEvents.afterCollapse]: (id: Id, dir?: TreeDirection) => void;
    [DiagramEvents.beforeExpand]: (id: Id, dir?: TreeDirection) => boolean | void;
    [DiagramEvents.afterExpand]: (id: Id, dir?: TreeDirection) => void;
    [DiagramEvents.shapeMouseDown]: (id: Id, event: MouseEvent, position?: ICoords) => void;
    [DiagramEvents.shapeClick]: (id: Id, event: MouseEvent) => void;
    [DiagramEvents.shapeDblClick]: (id: Id, event: MouseEvent) => void;
    [DiagramEvents.lineMouseDown]: (id: Id, event: MouseEvent, position?: ICoords) => void;
    [DiagramEvents.lineClick]: (id: Id, event: MouseEvent) => void;
    [DiagramEvents.lineDblClick]: (id: Id, event: MouseEvent) => void;
    [DiagramEvents.lineTitleMouseDown]: (lineId: Id, titleId: Id, event: MouseEvent) => void;
    [DiagramEvents.lineTitleClick]: (lineId: Id, titleId: Id, event: MouseEvent) => void;
    [DiagramEvents.lineTitleDblClick]: (lineId: Id, titleId: Id, event: MouseEvent) => void;
    [DiagramEvents.groupMouseDown]: (id: Id, event: MouseEvent, position?: ICoords) => void;
    [DiagramEvents.groupClick]: (id: Id, event: MouseEvent) => void;
    [DiagramEvents.groupDblClick]: (id: Id, event: MouseEvent) => void;
    [DiagramEvents.groupHeaderClick]: (id: Id, event: MouseEvent, subHeaderId?: string) => void;
    [DiagramEvents.groupHeaderDblClick]: (id: Id, event: MouseEvent, subHeaderId?: string) => void;
    [DiagramEvents.itemMouseDown]: (id: Id, event: MouseEvent, position?: ICoords) => void;
    [DiagramEvents.itemClick]: (id: Id, event: MouseEvent) => void;
    [DiagramEvents.itemDblClick]: (id: Id, event: MouseEvent) => void;
    [DiagramEvents.itemMouseOver]: (id: Id, event: MouseEvent) => void;
    [DiagramEvents.itemMouseOut]: (id: Id, event: MouseEvent) => void;
    /**
     * @deprecated since v5.0. Use {@link DiagramEvents.itemMouseOver} and {@link DiagramEvents.itemMouseOut} instead.
     * See https://docs.dhtmlx.com/diagram/migration/
     */
    [DiagramEvents.shapeHover]: (id: Id, event: MouseEvent) => void;
}
/**
 * Base configuration properties shared by all diagram items (shapes, lines, groups).
 * Supports arbitrary custom properties via the index signature.
 */
export interface IBaseItemConfig {
    /** The unique identifier of the item. Auto-generated if not provided. */
    id?: Id;
    /** The type name of the item (e.g., `"rectangle"`, `"$group"`, `"line"`). */
    type?: string;
    /** The horizontal position of the item on the canvas. */
    x?: number;
    /** The vertical position of the item on the canvas. */
    y?: number;
    /** The width of the item in pixels. */
    width?: number;
    /** The height of the item in pixels. */
    height?: number;
    /** Whether the item is hidden from the canvas. */
    hidden?: boolean;
    /** Whether the item is fixed (non-draggable). */
    fixed?: boolean;
    /** @internal The role assigned to this item by the engine. */
    $role?: Role;
    /** @internal The id of the parent group containing this item. */
    $group?: Id;
    /** @internal Computed x-offset within a group. */
    $gx?: number;
    /** @internal Computed y-offset within a group. */
    $gy?: number;
    /** @internal Rendered x-position. */
    $x?: number;
    /** @internal Rendered y-position. */
    $y?: number;
    /** Allows arbitrary custom properties on any item. Required for custom shape data. */
    [key: string]: any;
}
/** Runtime interface for a rendered diagram item. */
export interface IBaseItem {
    /** The item's configuration object. */
    config: IBaseItemConfig;
    /** The unique identifier of the item. */
    id: Id;
    /** Checks whether the given rectangle overlaps with this item. */
    isLocate(shape: IMeasuredItem): boolean;
    /** Whether this item is fixed (non-draggable). */
    isFixed(): boolean;
    /** Whether this item supports resizing. */
    canResize(): boolean;
    /** Returns the bounding box of this item. */
    getBox(): IBoxSize;
    /** Returns the VNode tree for rendering this item. */
    render(): VNode;
    /** Returns the editor overlay VNode for this item. */
    getEditorNode(): VNode;
    /** Sets the editor overlay VNode for this item. */
    setEditorNode(editor: VNode): void;
    /** Whether inline text editing is enabled for this item (or a specific sub-header). */
    isEditable(subheaderId?: string): boolean;
    /** Destroys this item instance and releases resources. */
    destructor(): void;
}
/** Additional configuration properties for items in org chart mode. */
export interface IOrgSpecialItemConfig {
    /** Whether child branches are expanded. */
    open?: boolean;
    /** Horizontal offset from the auto-calculated position. */
    dx?: number;
    /** Vertical offset from the auto-calculated position. */
    dy?: number;
    /** The id of the parent item in the org chart hierarchy. */
    parent?: Id;
    /** Whether this item is an assistant (placed to the side of the parent). */
    assistant?: boolean;
    /** Whether this item is a partner (placed beside the parent). */
    partner?: boolean;
    /** Whether this item can accept dragged items as children. */
    catchItem?: boolean;
    /** Whether child items can be dragged out of this item's branch. */
    giveItem?: boolean;
    /** @internal Whether this item is a valid drop target. */
    $target?: boolean;
    /** @internal The color of the expand/collapse toggle. */
    $expandColor?: string;
    /** @internal The count of hidden children. */
    $count?: number;
    /** @internal The resolved parent id. */
    $parent?: string;
    /** @internal The nesting level in the hierarchy. */
    $level?: number;
    /** @internal Array of assistant item ids. */
    $assistants?: Id[];
    /** @internal Partner items with layout metadata. */
    $partners?: {
        common: Id[];
        leftHeight?: number;
        rightHeight?: number;
    };
    /** @internal Whether this item is at an even level. */
    $even?: boolean;
    /** @internal Computed width. */
    $width?: number;
    /** @internal Computed height. */
    $height?: number;
    /** @internal Base height before adjustments. */
    $baseHeight?: number;
}
/** Additional configuration properties for items in mind map mode. */
export interface IMindMapSpecialItemConfig {
    /** The id of the parent item in the mind map hierarchy. */
    parent?: Id;
    /** Whether child branches are expanded. */
    open?: boolean;
    /** Horizontal offset from the auto-calculated position. */
    dx?: number;
    /** Vertical offset from the auto-calculated position. */
    dy?: number;
    /** Per-direction expand/collapse state. */
    openDir?: {
        /** Whether the left branch is expanded. */
        left?: boolean;
        /** Whether the right branch is expanded. */
        right?: boolean;
    };
    /** Whether this item can accept dragged items as children. */
    catchItem?: boolean;
    /** Whether child items can be dragged out of this item's branch. */
    giveItem?: boolean;
    /** @internal Whether this item is a valid drop target. */
    $target?: boolean;
    /** @internal The color of the expand/collapse toggle. */
    $expandColor?: string;
    /** @internal The count of hidden children. */
    $count?: number;
    /** @internal The resolved parent id. */
    $parent?: string;
    /** @internal The nesting level in the hierarchy. */
    $level?: number;
}
/** Computed layout coordinates for a PERT chart item (set by the auto-layout engine). */
export interface IPertLayout {
    /** The column index of this item in the PERT grid. */
    column: number;
    /** The starting column for multi-column items. */
    startColumn: number;
    /** The ending column for multi-column items. */
    endColumn: number;
    /** The row index of this item in the PERT grid. */
    rowIndex: number;
    /** The computed height of this item. */
    height: number;
    /** The computed width of this item. */
    width: number;
    /** The computed x-position of this item. */
    x: number;
    /** The computed y-position of this item. */
    y: number;
}
/** Additional configuration properties for items in PERT chart mode. */
export interface IPertSpecialItemConfig {
    /** The id of the parent item in the PERT hierarchy. */
    parent?: Id;
    /** @internal Computed layout position data. */
    $layout?: IPertLayout;
}
/**
 * Combined base configuration for all shape types.
 * Merges org chart, mind map, and PERT-specific properties into a single interface.
 */
export interface IBaseShapeConfig extends IBaseItemConfig, IOrgSpecialItemConfig, IMindMapSpecialItemConfig, IPertSpecialItemConfig {
    /** A CSS class name applied to the shape element. */
    css?: string;
    /** The rotation angle of the shape in degrees. */
    angle?: number;
    /** A custom preview image or preview configuration for the shapebar. */
    preview?: string | IPreview;
    /** Whether this shape supports inline text editing. */
    editable?: boolean;
    /** @internal Whether inline editing is currently active. */
    $editable?: boolean;
    /** @internal Connection point coordinates. */
    $connection?: string[][];
    /** @internal Whether this shape is currently selected. */
    $selected?: boolean;
    /** @internal Whether this shape is currently being moved. */
    $move?: boolean;
    /** @internal Whether the diagram is in connection drawing mode. */
    $connectMode?: boolean;
    /** @internal Reference to the rendered shape instance. */
    $item?: IBaseShape;
}
/** Runtime interface for a rendered shape item. */
export interface IBaseShape extends IBaseItem {
    /** The shape's configuration object. */
    config: IBaseShapeConfig;
    /** Returns the closest point on this shape's border to the given coordinates. */
    getPoint(x: number, y: number): ICoords;
    /** Returns the center point of this shape. */
    getCenter(): ICoords;
}
/** Configuration for built-in flow-chart shapes (rectangles, diamonds, circles, etc.). */
export interface IFlowShapeConfig extends IBaseShapeConfig {
    /** The background fill color. */
    fill?: string;
    /** The text content displayed inside the shape. */
    text?: string;
    /** The color of the text. */
    fontColor?: string;
    /** The font style (normal, italic, oblique). */
    fontStyle?: FontStyle;
    /** The font weight (e.g., `"bold"`, `"normal"`, `"600"`). */
    fontWeight?: string;
    /** The font size in pixels. */
    fontSize?: number;
    /** Horizontal alignment of text within the shape. */
    textAlign?: TextAlign;
    /** Vertical alignment of text within the shape. */
    textVerticalAlign?: TextVerticalAlign;
    /** The line height multiplier for text. */
    lineHeight?: number;
    /** The border stroke color. */
    stroke?: string;
    /** The border stroke width in pixels. */
    strokeWidth?: number;
    /** The border stroke style. */
    strokeType?: TLineType;
    /** A custom SVG dash array string for the border. */
    strokeDash?: string;
}
/**
 * Configuration for user-defined custom shapes.
 * Supports arbitrary properties via the index signature for template data binding.
 */
export interface ICustomShapeConfig extends IBaseShapeConfig {
    /** Allows arbitrary custom properties for template data binding. */
    [key: string]: any;
}
/** Configuration for the basic org chart card shape. */
export interface IOrgCardConfig extends IBaseItemConfig {
    /** The main text content of the card. */
    text?: string;
    /** The background color of the card header stripe. */
    headerColor?: string;
}
/** Configuration for the org chart card shape with an image. */
export interface IImgOrgCardConfig extends IOrgCardConfig {
    /** The secondary title text displayed below the main text. */
    title?: string;
    /** URL or path to the card image. */
    img?: string;
}
/** Configuration for the standalone text shape. */
export interface ITextShapeConfig extends IBaseShapeConfig {
    /** The background fill color. */
    backgroundColor?: string;
    /** The text content displayed inside the shape. */
    text?: string;
    /** The color of the text. */
    fontColor?: string;
    /** The font style (normal, italic, oblique). */
    fontStyle?: FontStyle;
    /** The font weight (e.g., `"bold"`, `"normal"`, `"600"`). */
    fontWeight?: string;
    /** The font size in pixels. */
    fontSize?: number;
    /** The line height multiplier for text. */
    lineHeight?: number;
    /** Horizontal alignment of text within the shape. */
    textAlign?: TextAlign;
    /** Vertical alignment of text within the shape. */
    textVerticalAlign?: TextVerticalAlign;
}
/** Configuration for a PERT task shape. */
export interface ITaskShapeConfig extends IBaseShapeConfig {
    /** The task name. */
    text?: string;
    /** The task start date (string or Date object). */
    start_date?: string | Date;
    /** The task end date (string or Date object). */
    end_date?: string | Date;
    /** The task duration in days. */
    duration?: number;
    /** The id of the parent project group, or `null` for top-level tasks. */
    parent?: Id | null;
}
/** Configuration for a PERT milestone shape. */
export interface IMilestoneShapeConfig extends IBaseShapeConfig {
    /** The milestone name. */
    text?: string;
    /** The id of the parent project group, or `null` for top-level milestones. */
    parent?: Id | null;
}
/** Configuration for a mind map topic shape. Alias for {@link IFlowShapeConfig}. */
export type ITopicShapeConfig = IFlowShapeConfig;
/** Union of all possible shape configuration types. */
export type ShapeConfig = IOrgCardConfig | IImgOrgCardConfig | ITopicShapeConfig | ITextShapeConfig | IFlowShapeConfig | ICustomShapeConfig | ITaskShapeConfig | IMilestoneShapeConfig;
/**
 * Configuration for a connector line between two shapes.
 * @example
 * ```ts
 * const line: ILineConfig = {
 *     id: "line_1",
 *     type: "line",
 *     from: "shape_1",
 *     to: "shape_2",
 *     connectType: "elbow",
 *     cornersRadius: 5,
 *     forwardArrow: "filled",
 *     backArrow: "none",
 *     fromSide: "right",
 *     toSide: "left",
 * };
 * ```
 */
export interface ILineConfig extends IBaseItemConfig {
    /** The visual stroke style of the line. */
    type?: TLineType;
    /** The routing algorithm for this line. */
    connectType?: ConnectType;
    /** The rendering direction of the line. */
    dir?: LineDirection;
    /** The id of the source shape. */
    from?: string;
    /** The id of the target shape. */
    to?: string;
    /** An array of intermediate waypoints for the line path. */
    points?: ICoords[];
    /** Arrow visibility on the source end of the line. */
    backArrow?: Arrows;
    /** Arrow visibility on the target end of the line. */
    forwardArrow?: Arrows;
    /** The side of the source shape where the line originates. */
    fromSide?: LineShapeSide;
    /** The side of the target shape where the line terminates. */
    toSide?: LineShapeSide;
    /** The corner radius for elbow-style connectors in pixels. */
    cornersRadius?: number;
    /** The stroke width of the line in pixels. */
    strokeWidth?: number;
    /** The stroke style of the line. */
    strokeType?: TLineType;
    /** The stroke color of the line. */
    stroke?: string;
    /** A custom gap value that overrides the global line gap for this line. */
    customGap?: number;
    /** @internal The id of the currently selected control point. */
    $selectedPoint?: string;
    /** @internal Whether inline editing is active on this line. */
    $editable?: boolean;
    /** @internal Whether this line is currently being moved. */
    $move?: boolean;
    /** @internal Whether the diagram is in connection drawing mode. */
    $connectMode?: boolean;
    /** @internal Reference to the rendered Line instance. */
    $item?: Line;
    /** @internal Whether this line is currently selected. */
    $selected?: boolean;
    /** @internal The id of the selected sub-element (e.g., a title). */
    $subSelected?: Id;
}
/** Configuration for a text label attached to a connector line. */
export interface ILineTitleConfig extends IBaseItemConfig {
    /** The item type, always `"lineTitle"`. */
    type: "lineTitle";
    /** The text content of the title. */
    text: string;
    /** The relative position along the line (0 to 1). */
    distance?: number;
    /** Whether the title position is automatically calculated. */
    autoPosition?: boolean;
    /** Whether the title supports inline text editing. */
    editable?: boolean;
    /** The background fill color. */
    fill?: string;
    /** The font size (in pixels or as a string with units). */
    fontSize?: number | string;
    /** The line height (in pixels or as a string with units). */
    lineHeight?: number | string;
    /** The font style (normal, italic, oblique). */
    fontStyle?: FontStyle;
    /** The color of the text. */
    fontColor?: string;
    /** The font weight (e.g., `"bold"`, `"normal"`, `"600"`). */
    fontWeight?: string;
    /** Horizontal alignment of the title text. */
    textAlign?: TextAlign;
    /** @internal The computed rotation angle of the title. */
    $angle?: number;
    /** @internal Whether this title is currently selected. */
    $selected?: boolean;
    /** @internal Whether inline editing is active on this title. */
    $editable?: boolean;
    /** @internal Whether this title is currently being moved. */
    $move?: boolean;
    /** @internal Reference to the rendered LineTitle instance. */
    $item?: LineTitle;
}
/** Visual styling properties for a group container. */
export interface IGroupStyle {
    /** The border stroke style (only `"line"` is supported). */
    strokeType?: "line";
    /** The border stroke width. */
    strokeWidth?: string | number;
    /** The border stroke color. */
    stroke?: string;
    /** The CSS border-style value (e.g., `"solid"`, `"dashed"`). */
    borderStyle?: string;
    /** The background fill color. */
    fill?: string;
    /** The background fill color when an item is dragged over the group. */
    overFill?: string;
    /** The background fill color when an item is partially inside the group. */
    partiallyFill?: string;
}
/** Configuration for the header bar of a group or swimlane. */
export interface IGroupHeader {
    /** The height of the header bar. */
    height?: number | string;
    /** The background fill color of the header. */
    fill?: string;
    /** The text content of the header. */
    text?: string;
    /** The font size (in pixels or as a string with units). */
    fontSize?: number | string;
    /** The line height (in pixels or as a string with units). */
    lineHeight?: number | string;
    /** Horizontal alignment of the header text. */
    textAlign?: TextAlign;
    /** Vertical alignment of the header text. */
    textVerticalAlign?: TextVerticalAlign;
    /** The font style (normal, italic, oblique). */
    fontStyle?: FontStyle;
    /** The color of the header text. */
    fontColor?: string;
    /** The font weight (e.g., `"bold"`, `"normal"`, `"600"`). */
    fontWeight?: string;
    /** The color of the expand/collapse icon. */
    iconColor?: string;
    /**
     * The position of the header relative to the group body.
     * @default "top"
     */
    position?: BaseDirection;
    /**
     * Whether the header text supports inline editing.
     * @default false
     */
    editable?: boolean;
    /**
     * Whether the group can be collapsed/expanded via the header.
     * @default false
     */
    closable?: boolean;
    /**
     * Whether the header is visible.
     * @default true
     */
    enable?: boolean;
}
/** Rules for how items enter (are caught by) a group when dragged nearby. */
export interface IEntryArea {
    /** The distance in pixels around the group border that triggers item capture. */
    catchArea: number;
    /** Whether the catch area border adjusts flexibly to the group's content. */
    borderFlexible: boolean;
}
/** Rules for how items exit (leave) a group container. */
export interface IExitArea {
    /** The behavior when an item is dragged out of the group. */
    groupBehavior: "unbound" | "boundNoBorderExtension" | "boundBorderExtension";
    /** The padding around the group border for the exit area in pixels. */
    padding?: number;
}
/** Base configuration properties shared by groups and swimlanes. */
export interface IBaseGroupConfig extends IBaseItemConfig {
    /** Array of child item ids contained in this group. */
    groupChildren?: Id[];
    /** Visual styling of the group container. */
    style?: IGroupStyle;
    /** Configuration for the group header bar. */
    header?: IGroupHeader;
    /** Rules for item entry (capture) behavior. */
    entryArea?: IEntryArea;
    /** Rules for item exit behavior. */
    exitArea?: IExitArea;
    /** Whether the group is currently expanded. */
    open?: boolean;
    /** @internal Reference to the rendered group instance. */
    $item?: IGroup;
    /** @internal The minimum bounding box for the group. */
    $minBox?: IBoxSize;
    /** @internal Whether inline editing is active. */
    $editable?: boolean;
    /** @internal Computed height. */
    $height?: number;
    /** @internal Computed width. */
    $width?: number;
    /** @internal The capture area state during drag operations. */
    $captureArea?: "over" | "out" | "partially";
}
/** Runtime interface for a rendered group item. */
export interface IBaseGroup extends IBaseItem {
    /** Returns the percentage of overlap between the given box and this group. */
    getLocatePercent(box: IBoxSize): number;
    /** Tracks a child item's movement and returns whether the group should adjust. */
    trackChildMove(box: IBoxSize, mov: IBaseCoords): boolean;
    /** Returns the bounding box of all child items. */
    getChildBox(): IBoxSize;
    /** Sets or resets the minimum bounding box for the group. */
    setMinBox(box?: IBoxSize): void;
}
/**
 * Configuration for a standard group container.
 * @example
 * ```ts
 * const group: IGroupConfig = {
 *     type: "$group",
 *     id: "group_1",
 *     x: 50,
 *     y: 50,
 *     width: 400,
 *     height: 300,
 *     groupChildren: ["shape_1", "shape_2"],
 *     header: { enable: true, text: "Group Title", closable: true },
 *     style: { stroke: "#ccc", fill: "#f5f5f5" },
 * };
 * ```
 */
export interface IGroupConfig extends IBaseGroupConfig {
    /** The item type discriminator, always `"$group"`. */
    type: "$group";
}
/** Runtime interface for a rendered standard group. */
export interface IGroup extends IBaseGroup {
    /** The group's configuration object. */
    config: IGroupConfig;
}
/**
 * Configuration for a swimlane container with row/column sub-headers.
 * @example
 * ```ts
 * const swimlane: ISwimlaneConfig = {
 *     type: "$swimlane",
 *     id: "swimlane_1",
 *     x: 0,
 *     y: 0,
 *     width: 800,
 *     height: 600,
 *     layout: [
 *         ["cell_1", "cell_2"],
 *         ["cell_3", "cell_4"],
 *     ],
 *     subHeaderRows: {
 *         enable: true,
 *         position: "left",
 *         headers: [
 *             { text: "Row 1" },
 *             { text: "Row 2" },
 *         ],
 *     },
 *     subHeaderCols: {
 *         enable: true,
 *         position: "top",
 *         headers: [
 *             { text: "Col A" },
 *             { text: "Col B" },
 *         ],
 *     },
 * };
 * ```
 */
export interface ISwimlaneConfig extends IBaseGroupConfig {
    /** The item type discriminator, always `"$swimlane"`. */
    type: "$swimlane";
    /** A 2D array of cell ids defining the swimlane grid layout. */
    layout: Id[][];
    /** Configuration for swimlane row sub-headers. */
    subHeaderRows?: ISubHeaderConfigRows;
    /** Configuration for swimlane column sub-headers. */
    subHeaderCols?: ISubHeaderConfigCols;
}
/** Runtime interface for a rendered swimlane. */
export interface ISwimlane extends IBaseGroup {
    /** The swimlane's configuration object. */
    config: ISwimlaneConfig;
    /** Whether a specific sub-header supports inline editing. */
    isEditable(subheaderId: string): boolean;
}
/** Configuration for a cell within a swimlane layout. */
export interface IGroupSwimlaneConfig extends IBaseGroupConfig {
    /** The item type discriminator, always `"$sgroup"`. */
    type: "$sgroup";
    /** @internal The border visibility for this cell's edges. */
    $borderPosition?: {
        left: boolean;
        top: boolean;
    };
    /** @internal The number of rows this cell spans. */
    $rowCount?: number;
    /** @internal The number of columns this cell spans. */
    $colCount?: number;
}
/** Runtime interface for a rendered swimlane cell. */
export interface IGroupSwimlane extends IBaseGroup {
    /** The swimlane cell's configuration object. */
    config: IGroupSwimlaneConfig;
}
/** Configuration for a project group in PERT chart mode. */
export interface IProjectConfig extends IBaseGroupConfig {
    /** The item type discriminator, always `"project"`. */
    type: "project";
    /** The id of the parent project, or `null` for top-level projects. */
    parent?: Id | null;
    /** The project name. */
    text?: string;
}
/** Base text/style properties shared by all sub-header elements. */
export interface IBaseSubHeaderConfig {
    /** The background fill color. */
    fill?: string;
    /** The font size (in pixels or as a string with units). */
    fontSize?: number | string;
    /** The line height (in pixels or as a string with units). */
    lineHeight?: number | string;
    /** Horizontal alignment of the sub-header text. */
    textAlign?: TextAlign;
    /** Vertical alignment of the sub-header text. */
    textVerticalAlign?: TextVerticalAlign;
    /** The font style (normal, italic, oblique). */
    fontStyle?: FontStyle;
    /** The color of the sub-header text. */
    fontColor?: string;
    /** The font weight (e.g., `"bold"`, `"normal"`, `"600"`). */
    fontWeight?: string;
    /** The color of the context menu icon. */
    iconColor?: string;
    /** Whether the sub-header text supports inline editing. */
    editable?: boolean;
}
/** Configuration for an individual sub-header row or column label. */
export interface ISubHeaderConfig extends IBaseSubHeaderConfig {
    /** The unique identifier of this sub-header. */
    id?: string;
    /** The text content of the sub-header label. */
    text: string;
    /** @internal Context menu configuration for this sub-header. */
    $subMenu?: ISubMenuConfig;
    /** @internal Whether this sub-header can be reordered by dragging. */
    $movePermit?: boolean;
}
/** Configuration block for swimlane row sub-headers. */
export interface ISubHeaderConfigRows extends IBaseSubHeaderConfig {
    /** The height of the row sub-header area. */
    height?: number | string;
    /** The position of row sub-headers relative to the swimlane body. */
    position?: "left" | "right";
    /** Whether row sub-headers are visible. */
    enable?: boolean;
    /** Array of individual row sub-header configurations. */
    headers?: ISubHeaderConfig[];
}
/** Configuration block for swimlane column sub-headers. */
export interface ISubHeaderConfigCols extends IBaseSubHeaderConfig {
    /** The height of the column sub-header area. */
    height?: number | string;
    /** The position of column sub-headers relative to the swimlane body. */
    position?: "top" | "bottom";
    /** Whether column sub-headers are visible. */
    enable?: boolean;
    /** Array of individual column sub-header configurations. */
    headers?: ISubHeaderConfig[];
}
/** Configuration for the context menu shown on a sub-header. */
export interface ISubMenuConfig {
    /** Whether the context menu is enabled for this sub-header. */
    enable: boolean;
    /** The menu items to display. */
    data: IDataItem[];
}
/** Union of all top-level item configuration types that can appear in diagram data. */
export type ItemConfig = IGroupConfig | ISwimlaneConfig | IOrgCardConfig | IImgOrgCardConfig | ITopicShapeConfig | ITextShapeConfig | IFlowShapeConfig | ICustomShapeConfig | ILineConfig;
