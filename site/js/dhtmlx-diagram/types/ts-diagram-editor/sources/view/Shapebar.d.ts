import { View } from "../../../ts-common/view";
import { IEventSystem } from "../../../ts-common/events";
import { DiagramEditorEvents, IDiagramEditor, IDiagramEditorHandlersMap } from "../types";
/** Preview thumbnail scaling and spacing configuration for the shapebar. */
interface IPreview {
    /** The scale factor for rendering shape previews in the shapebar. */
    scale?: number;
    /** The gap (margin) between preview thumbnails. */
    gap?: number | string;
}
/** A map of built-in shape group flags (e.g., `{ flowShapes: true }`) used in shapebar sections. */
type TCombinedSection = {
    [name: string]: boolean;
};
/** A custom shape definition for a shapebar section, with a required type and arbitrary extra properties. */
type TCustomUnit = {
    /** The shape type name. */
    type: string;
    /** Allows arbitrary custom properties for the shape preview. */
    [key: string]: any;
};
/** Named sections of the shapebar, each containing an array of shape entries (strings, group flags, or custom shapes). */
export type TShapeSections = {
    [key: string]: (TCombinedSection | TCustomUnit | string)[];
};
/** Top-level configuration for the shapebar panel. */
export interface IShapebarConfig {
    /** The width of the shapebar panel in pixels. */
    width?: number;
    /** Named sections of shapes to display in the shapebar. */
    sections?: TShapeSections;
    /** Preview thumbnail rendering configuration. */
    preview?: IPreview;
}
export declare class Shapebar extends View {
    config: IShapebarConfig;
    events: IEventSystem<DiagramEditorEvents, IDiagramEditorHandlersMap>;
    private _htmlEvents;
    private _shadow;
    private _dropdowns;
    private _shapes;
    private _defaults;
    private _pressedShapeInfo;
    private _pull;
    private _data;
    private _editor;
    constructor(config: IShapebarConfig, editor: IDiagramEditor);
    private _handleMove;
    private _handleUp;
    private _toggle;
    private _getTextIcon;
    private _wrapDropdown;
    private _getShadow;
    private _getWrapped;
    private getGroupNode;
    private getSwimlaneNode;
    private _shapeInit;
    private _barCreator;
    private _getShapeSection;
    private _addToPull;
    private _render;
}
export {};
