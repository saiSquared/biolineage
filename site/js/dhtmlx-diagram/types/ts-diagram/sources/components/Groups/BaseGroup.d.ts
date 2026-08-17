import { VNode } from "../../../../ts-common/dom";
import { IDataItem } from "../../../../ts-data";
import { IBaseCoords, IBaseGroup, IBoxSize, IBaseGroupConfig, ConnectSide } from "../../../../ts-diagram";
import { ShapesCollection } from "../../modules/ShapesCollection";
import { BaseItem } from "../BaseItem";
export declare class BaseGroup extends BaseItem implements IBaseGroup {
    config: IBaseGroupConfig;
    protected data: ShapesCollection;
    constructor(config: IBaseGroupConfig, params: any);
    isEditable(subheaderId?: string): boolean;
    getLocatePercent(box: IBoxSize): number;
    setMinBox(box?: IBoxSize): void;
    getBox(): IBoxSize;
    getPoint(x: number, y: number): IBaseCoords;
    getConnectionPoint(coords: IBaseCoords, side: ConnectSide, gap?: number): IBaseCoords;
    getChildBox(): IBoxSize;
    trackChildMove(box: IBoxSize, mov: IBaseCoords): boolean;
    getChildHtmlNodes(config: IBaseGroupConfig, data: ShapesCollection | IDataItem[]): VNode[];
    getChildSvgNodes({ $typeConfig, x, y, groupChildren, header }: IBaseGroupConfig, data: ShapesCollection): VNode[];
    protected getGroupHeader(config: IBaseGroupConfig, editorNode: VNode): VNode;
    protected setDefaults(config: IBaseGroupConfig): IBaseGroupConfig;
    protected setServiceProp(config: IBaseGroupConfig): void;
}
