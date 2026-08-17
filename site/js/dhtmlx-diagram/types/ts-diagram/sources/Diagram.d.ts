import { IEventSystem } from "../../ts-common/events";
import { View } from "../../ts-common/view";
import { Exporter } from "./modules/Export";
import { Selection } from "./modules/Selection";
import { ShapesCollection } from "./modules/ShapesCollection";
import { Toolbar } from "./modules/Toolbar";
import { DataEvents, DiagramEvents, ICoords, IDiagram, IDiagramConfig, IBaseShape, SelectionEvents, IDiagramEventHandlersMap, ICustomShapeParam, IAutoPlacement, TreeDirection, IBaseCoords } from "./types";
import { Id, ISelectionEventsHandlersMap } from "../../ts-common/types";
import { Editor, EditorEvents } from "./modules/Editor";
import { CellManager, CellManagerEvents, ICellManagerHandlersMap } from "./modules/CellManager";
import { IDataItem } from "../../ts-data";
import { RoleManager } from "./modules/RoleManager";
/**
 * The main Diagram widget. Renders shapes, lines, groups, and swimlanes on an
 * SVG/HTML canvas with built-in selection, inline editing, export, and event support.
 *
 * @example
 * ```ts
 * const diagram = new Diagram("container", {
 *     type: "default",
 *     select: true,
 *     scale: 1,
 *     toolbar: [
 *         { id: "remove", content: "<i class='dxi dxi-delete'></i>" },
 *     ],
 * });
 *
 * diagram.data.parse([
 *     { id: "1", type: "rectangle", x: 100, y: 100, text: "Start" },
 *     { id: "2", type: "rectangle", x: 300, y: 100, text: "End" },
 *     { id: "l1", type: "line", from: "1", to: "2" },
 * ]);
 * ```
 */
export declare class Diagram extends View implements IDiagram {
    /** The current version string of the Diagram library. */
    version: string;
    /** The active configuration object of the diagram. */
    config: IDiagramConfig;
    /** The event system for subscribing to diagram, data, selection, editor, and cell manager events. */
    events: IEventSystem<DataEvents | SelectionEvents | DiagramEvents | EditorEvents | CellManagerEvents, IDiagramEventHandlersMap | ICellManagerHandlersMap | ISelectionEventsHandlersMap>;
    /** The shapes data collection managing all diagram items. */
    data: ShapesCollection;
    /** The selection manager for tracking selected items. */
    selection: Selection;
    /** The export module for PDF and PNG export. */
    export: Exporter;
    /** The floating toolbar shown near selected shapes. */
    toolbar: Toolbar;
    /** The inline text editor module. */
    editor: Editor;
    /** The cell manager for swimlane row/column operations. */
    cellManager: CellManager;
    /** The role manager that maps item types to rendering roles. */
    roleManager: RoleManager;
    /** Registry of built-in and custom flow shape SVG templates, keyed by type name. */
    flowShapes: any;
    private _lastItemClickCoords;
    private _htmlEvents;
    private _diagramSize;
    private _active;
    private _orgTypes;
    private _menu;
    private _backgroundPos;
    /**
     * Creates a new Diagram instance and renders it into the given container.
     * @param container - An HTML element or a CSS selector string for the container.
     * @param config - Optional diagram configuration.
     */
    constructor(container: HTMLElement | any, config?: IDiagramConfig);
    /**
     * Registers a custom shape type with a rendering template and optional defaults.
     * Cannot override built-in shape types (e.g., `"line"`, `"card"`, `"rectangle"`).
     * @param type - The unique type name for the custom shape.
     * @param parameters - The shape parameters including the template function, optional defaults, and event handlers.
     * @throws Error if the type name conflicts with a built-in type or if `template` is not a function.
     * @example
     * ```ts
     * diagram.addShape("custom-card", {
     *     template: (config) => `<section><h3>${config.text}</h3></section>`,
     *     defaults: { width: 200, height: 100, text: "New Card" },
     * });
     * ```
     */
    addShape(type: string, parameters: ICustomShapeParam): void;
    /**
     * Returns the shape instance located at the position of the given DOM event.
     * @param event - A DOM event (e.g., click, mouseover) with positional data.
     * @returns The shape instance at the event position, or `null` if no shape was found.
     */
    locate(event: Event): IBaseShape;
    /**
     * Collapses a branch of the diagram tree, hiding all child items.
     * In mindmap mode, optionally collapses only the left or right branch from the root.
     *
     * Fires {@link DiagramEvents.beforeCollapse} and {@link DiagramEvents.afterCollapse}.
     * @param id - The id of the shape to collapse.
     * @param dir - Optional direction for mindmap root collapse (`"left"` or `"right"`).
     */
    collapseItem(id: Id, dir?: TreeDirection): void;
    /**
     * Expands a collapsed branch of the diagram tree, showing all child items.
     * In mindmap mode, optionally expands only the left or right branch from the root.
     * Recursively expands parent items if they are also collapsed.
     *
     * Fires {@link DiagramEvents.beforeExpand} and {@link DiagramEvents.afterExpand}.
     * @param id - The id of the shape to expand.
     * @param dir - Optional direction for mindmap root expansion (`"left"` or `"right"`).
     */
    expandItem(id: Id, dir?: TreeDirection): void;
    /**
     * Returns the current scroll position of the diagram viewport, adjusted by the scale factor.
     * @returns An object with `x` and `y` scroll offsets.
     */
    getScrollState(): ICoords;
    /**
     * Scrolls the diagram viewport to the specified coordinates, adjusted by the scale factor.
     * @param x - The horizontal scroll position.
     * @param y - The vertical scroll position.
     */
    scrollTo(x: number, y: number): void;
    /**
     * Expands the parent branch (if collapsed) and scrolls the viewport to bring the specified item into view.
     * @param id - The id of the item to show.
     * @param dir - Optional direction for mindmap root expansion (`"left"` or `"right"`).
     */
    showItem(id: Id, dir?: TreeDirection): void;
    /**
     * Automatically arranges all shapes in the diagram using a layout algorithm.
     * Only available for `"default"` and `"pert"` diagram types.
     *
     * Supports two placement modes:
     * - `"orthogonal"` — Hierarchical tree layout (Sugiyama-style).
     * - `"radial"` — Concentric circle layout.
     *
     * @param config - Optional auto-placement configuration overriding the diagram's `autoplacement` settings.
     * @throws Error if called on an org chart or mindmap diagram type.
     * @example
     * ```ts
     * // Auto-place with default settings
     * diagram.autoPlace();
     *
     * // Auto-place with radial layout
     * diagram.autoPlace({ placeMode: "radial" });
     *
     * // Auto-place with custom padding
     * diagram.autoPlace({
     *     mode: "edges",
     *     placeMode: "orthogonal",
     *     itemPadding: 50,
     *     levelPadding: 100,
     * });
     * ```
     */
    autoPlace(config?: IAutoPlacement): void;
    /**
     * Converts a pointer event's viewport coordinates to diagram canvas coordinates,
     * accounting for scroll offset, scale factor, and margin.
     * @param event - The pointer event with `clientX` and `clientY`.
     * @returns The corresponding diagram canvas coordinates as `{ x, y }`.
     */
    getCurrentCoords(event: PointerEvent): IBaseCoords;
    /**
     * Finds the nearest connector line to the pointer event position.
     * Uses perpendicular distance from the pointer to each line segment to determine proximity.
     * @param event - The pointer event with positional data.
     * @returns The data item of the nearest line, or `undefined` if no line is close enough.
     */
    findNearestConnector(event: PointerEvent): IDataItem;
    /**
     * Destroys the diagram instance, releasing all resources.
     * Clears data, events, selection, and unmounts the DOM element.
     */
    destructor(): void;
    protected _render(vm: any): any;
    protected _set_defaults(): void;
    protected _initEventsHandlers(): void;
    protected _init_struct(): void;
    protected _initEvents(): void;
    private _getContent;
    private _getPoint;
    private _getBackground;
    private setSelectionItem;
}
