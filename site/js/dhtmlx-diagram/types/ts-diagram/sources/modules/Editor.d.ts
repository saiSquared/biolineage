import { VNode } from "../../../ts-common/dom";
import { EventSystem } from "../../../ts-common/events";
import { Id } from "../../../ts-common/types";
import { ShapesCollection } from "./ShapesCollection";
/** Enumeration of events fired by the inline text editor module. */
export declare enum EditorEvents {
    /** Fired before the inline editor opens. Return `false` to prevent. */
    beforeEditorOpen = "beforeEditorOpen",
    /** Fired after the inline editor opens. */
    afterEditorOpen = "afterEditorOpen",
    /** Fired before the inline editor closes. Return `false` to prevent. */
    beforeEditorClose = "beforeEditorClose",
    /** Fired after the inline editor closes. */
    afterEditorClose = "afterEditorClose",
    /** Fired before the inline editor text is changed. Return `false` to prevent. */
    beforeEditorEditing = "beforeEditorEditing",
    /** Fired after the inline editor text is changed. */
    afterEditorEditing = "afterEditorEditing"
}
/** Maps each {@link EditorEvents} member to its handler function signature. */
export interface IEditorEventHandlersMap {
    /** Index signature required for TypeScript compatibility with computed property keys. */
    [key: string]: (...args: any[]) => any;
    [EditorEvents.beforeEditorOpen]: (id: Id, key: string, subId?: string) => boolean | void;
    [EditorEvents.afterEditorOpen]: (id: Id, key: string, subId?: string) => void;
    [EditorEvents.beforeEditorClose]: (id: Id, key: string, subId?: string) => boolean | void;
    [EditorEvents.afterEditorClose]: (id: Id, key: string, subId?: string) => void;
    [EditorEvents.beforeEditorEditing]: (value: string, currentValue: string, id: Id, key: string, subId?: string) => boolean | void;
    [EditorEvents.afterEditorEditing]: (value: string, id: Id, key: string, subId?: string) => void;
}
/** Configuration for the inline text editor module. */
export interface IEditorConfig {
    /** The shapes data collection. */
    data: ShapesCollection;
    /** The event system for editor events. */
    events: EventSystem<EditorEvents, IEditorEventHandlersMap>;
}
export interface IEditor {
    /** The shapes data collection. */
    data: ShapesCollection;
    /** The event system for editor events. */
    events: EventSystem<EditorEvents, IEditorEventHandlersMap>;
    /**
     * Opens the inline text editor for a specific item.
     * @param id - The id of the item to edit.
     * @param key - The property key to edit (e.g., `"text"`).
     * @param subId - Optional sub-header id for swimlane sub-header editing.
     * @returns `true` if the editor was opened successfully.
     */
    openEditor(id: Id, key?: string, subId?: string): boolean;
    /**
     * Closes the inline text editor.
     * @returns `true` if the editor was closed successfully.
     */
    closeEditor(): boolean;
    /**
     * Discards any unsaved changes and closes the inline text editor.
     * @returns `true` if the editor was closed successfully.
     */
    abortEditor(): boolean;
    /** Whether the inline editor is currently active. */
    isEditable(): boolean;
    /** Destroys the editor module and releases resources. */
    destructor(): void;
    /** Returns the VNode tree for rendering the inline editor overlay. */
    render(): VNode;
}
export declare class Editor implements IEditor {
    data: ShapesCollection;
    events: EventSystem<EditorEvents, IEditorEventHandlersMap>;
    private _editable;
    private _editableItem;
    private _documentClick;
    private _currentValue;
    private _originalValue;
    private _handlers;
    private _key;
    private _subId;
    private _dblDuration;
    constructor(config: IEditorConfig);
    openEditor(id: Id, key?: string, subId?: string): boolean;
    closeEditor(): boolean;
    abortEditor(): boolean;
    isEditable(): boolean;
    destructor(): void;
    render(): VNode;
    protected edit(value: string): void;
    private _initOuterClick;
    private _removeClickListener;
}
