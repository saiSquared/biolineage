import { IToolbarElement, ProToolbar } from "../../../ts-toolbar";
import { IItem } from "../../../ts-navbar";
import { IDiagramEditor } from "../types";
/** Union of all built-in toolbar item identifiers for the editor toolbar (file, edit, view, arrange, etc.). */
type TExtraToolbarType = "separator" | "spacer" | "file" | "importJson" | "export" | "exportJson" | "exportPdf" | "exportPng" | "edit" | "undo" | "redo" | "duplicate" | "copy" | "paste" | "copyStyle" | "pasteStyle" | "selectAll" | "selectNone" | "view" | "theme" | "themeLight" | "themeDark" | "themeLightContrast" | "themeDarkContrast" | "shapebar" | "editbar" | "grid" | "magnetic" | "connectionPoints" | "resizePoints" | "itemsDraggable" | "zoomIn" | "zoomOut" | "arrange" | "layout" | "layoutMode" | "layoutModeDirect" | "layoutOrthogonal" | "layoutRadial" | "align" | "alignHorizontalLeft" | "alignHorizontalCenter" | "alignHorizontalRight" | "alignVerticalTop" | "alignVerticalCenter" | "alignVerticalBottom" | "distribute" | "distributeVertical" | "distributeHorizontal" | "scale";
/** Additional properties for toolbar items beyond the standard navbar item interface. */
export type IExtraToolbarProperties = {
    /** Child items for dropdown/menu-style toolbar buttons. */
    items?: TToolbarCommonItem[];
    /** A function that returns a CSS icon class based on the editor state (for toggle icons). */
    checkIcon?: (editor: IDiagramEditor) => string;
    /** A click handler function for the toolbar item. */
    handler?: (editor: IDiagramEditor, event: Event) => void;
};
/** Configuration for a single toolbar item with type, hotkey, icon, and handler. */
export interface IToolbarItem extends Omit<IItem, "type">, IExtraToolbarProperties {
    /** The built-in toolbar item type identifier. */
    type: TExtraToolbarType;
    /** The display value/label for the toolbar item. */
    value?: string;
    /** The keyboard shortcut hint text displayed in the tooltip. */
    hotkey?: string;
    /** The CSS icon class for the toolbar item. */
    icon?: string;
}
/**
 * Union type representing any valid toolbar item configuration:
 * a string shorthand (built-in type), a full {@link IToolbarItem} config, or a navbar element with extra properties.
 */
export type TToolbarCommonItem = TExtraToolbarType | IToolbarItem | (IToolbarElement & IExtraToolbarProperties);
/** Top-level configuration for the editor toolbar component. */
export interface IToolbarConfig {
    /** A CSS class name applied to the toolbar container. */
    css?: string;
    /**
     * The navigation interaction mode for toolbar menus.
     * @default "click"
     */
    navigationType?: "click" | "pointer";
    /** Array of toolbar item configurations. */
    items?: TToolbarCommonItem[];
}
export declare class Toolbar extends ProToolbar {
    private _editor;
    private _meta;
    constructor(config: IToolbarConfig, editor: IDiagramEditor);
    parse(items: TToolbarCommonItem[]): void;
    private getPreparedItems;
    private checkIcons;
}
export {};
