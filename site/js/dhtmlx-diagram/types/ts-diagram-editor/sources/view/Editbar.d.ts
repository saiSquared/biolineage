import { Id } from "../../../ts-common/types";
import { IItem } from "../../../ts-form";
import { Cell } from "../../../ts-layout/sources/Cell";
import { IDiagramEditor } from "../types";
interface IHandlerConfig {
    id: Id;
    key: string | string[];
    editor: IDiagramEditor;
    control: IItem;
    value: any;
}
interface ISetValueConfig {
    editor: IDiagramEditor;
    control: IItem;
    value: any;
}
/** Base configuration for an editbar form control element. */
export interface IControlProperties {
    /** The form control type (e.g., `"input"`, `"colorpicker"`, `"select"`). */
    type: string;
    /** The data property key(s) this control edits. */
    key?: string | string[];
    /** Whether to wrap this control in a form group container. */
    wrap?: boolean;
    /** @internal The id of the parent control (for nested controls). */
    $parent?: Id;
    /** @internal Event handlers for this control's form events. */
    $on?: {
        [eventName: string]: (...args: any[]) => any;
    };
    /** @internal Child property controls for complex/composite controls. */
    $properties?: {
        [key: string]: IControlProperties;
    };
    /** Allows arbitrary form control configuration properties. */
    [key: string]: any;
}
/** Extended control definition with handler, value setter, and layout callbacks. */
export interface IControl extends IControlProperties {
    /** @internal Callback invoked when the control value changes. */
    $handler?: (obj: IHandlerConfig) => void;
    /** @internal Callback invoked to set the control's display value from data. */
    $setValue?: (obj: ISetValueConfig) => void;
    /** @internal Callback invoked to compute the control's layout configuration. */
    $layout?: (obj: any) => any;
}
/** A map of control type names to their {@link IControl} definitions. */
export interface IControls {
    [type: string]: IControl;
}
/** A map of item type names to their property panel control configurations. */
interface ITypeProperties {
    [type: string]: IControlProperties[] | ((obj?: any) => IControlProperties[]);
}
/** Top-level configuration for the editbar (property editor) panel. */
export interface IEditbarConfig {
    /** The width of the editbar panel in pixels. */
    width?: number;
    /** Custom control definitions to add or override built-in controls. */
    controls?: IControls;
    /** Custom property panel configurations per item type. */
    properties?: ITypeProperties;
}
export declare class Editbar {
    private _controls;
    private _properties;
    private _cell;
    private _form;
    private _editor;
    private _diagram;
    private _activeControls;
    constructor(cell: Cell, config: IEditbarConfig, editor: IDiagramEditor);
    isFocused(): boolean;
    private setControls;
    private getFormLayout;
    private getControlLayout;
    private getControlProperties;
    private getTypeProperties;
    private setForm;
    private useHandler;
    private useSetValue;
}
export {};
