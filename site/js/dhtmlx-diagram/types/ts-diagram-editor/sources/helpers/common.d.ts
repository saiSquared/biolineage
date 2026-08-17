import { IDataItem } from "../../../ts-data/sources/types";
import { ActionDirection } from "../../../ts-diagram/sources/types";
export declare function getHeaderColor(parent: any, type?: "child" | "partner" | "assistant"): string;
export declare function setValueFromCssVariable(object: any, node: any): void;
export declare function moveItem(editor: any, item: IDataItem, step: number, dir: ActionDirection): void;
