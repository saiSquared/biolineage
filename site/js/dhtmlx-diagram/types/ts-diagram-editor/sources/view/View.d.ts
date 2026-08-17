import { ILayoutEventHandlersMap, LayoutEvents } from "../../../ts-layout";
import { IToolbarConfig, Toolbar } from "./Toolbar";
import { IShapebarConfig, Shapebar } from "./Shapebar";
import { IDiagramEditor } from "../types";
import { VNode } from "../../../ts-common/dom";
import { IEventSystem } from "../../../ts-common/events";
import { Editbar, IEditbarConfig } from "./Editbar";
interface IView {
    events: IEventSystem<LayoutEvents, ILayoutEventHandlersMap>;
    hide(view?: TViewType): void;
    show(view?: TViewType): void;
    isVisible(view: TViewType): boolean;
}
type Views = {
    toolbar: Toolbar;
    shapebar: Shapebar;
    editbar: Editbar;
};
type TViewType = "toolbar" | "shapebar" | "editbar";
/** Base configuration shared by all editor view panel configs. */
export interface ICommonViewItemConfig {
    /** Whether this panel is visible on initialization. */
    show?: boolean;
    /** A CSS class name applied to the panel container. */
    css?: string;
}
/** Configuration for the editor toolbar panel. Extends toolbar and common view config. */
export interface IToolbarViewConfig extends ICommonViewItemConfig, IToolbarConfig {
}
/** Configuration for the shapebar panel. Extends shapebar and common view config. */
export interface IShapebarViewConfig extends ICommonViewItemConfig, IShapebarConfig {
}
/** Configuration for the editbar (property editor) panel. Extends editbar and common view config. */
export interface IEditbarViewConfig extends ICommonViewItemConfig, IEditbarConfig {
}
/** Top-level view configuration mapping panel names to their configs. */
export type ViewConfig = {
    /** Toolbar configuration. Set to `false` to hide, `true` for defaults, or provide a config object. */
    toolbar?: boolean | IToolbarViewConfig;
    /** Shapebar configuration. Set to `false` to hide, `true` for defaults, or provide a config object. */
    shapebar?: boolean | IShapebarViewConfig;
    /** Editbar configuration. Set to `false` to hide, `true` for defaults, or provide a config object. */
    editbar?: boolean | IEditbarViewConfig;
};
export declare class View implements IView {
    events: IEventSystem<LayoutEvents, ILayoutEventHandlersMap>;
    private _config;
    private _toolbar;
    private _shapebar;
    private _editbar;
    private _layout;
    private _diagram;
    private _editor;
    private _views;
    private _isDefault;
    constructor(container: HTMLElement, editor: IDiagramEditor);
    hide(view?: TViewType): void;
    show(view?: TViewType): void;
    isVisible(view: TViewType): boolean;
    getViews(): Views;
    paint(): void;
    destructor(): void;
    getRootView(): VNode;
    private isViewEnable;
}
export {};
