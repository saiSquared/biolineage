import { VNode } from "../../../../ts-common/dom";
import { ConnectSide, IBaseCoords, IProjectConfig } from "../../../../ts-diagram";
import { ShapesCollection } from "../../modules/ShapesCollection";
import { BaseGroup } from "./BaseGroup";
export declare class Project extends BaseGroup {
    config: IProjectConfig;
    protected data: ShapesCollection;
    private _pert_config;
    constructor(config: IProjectConfig, params: any);
    getConnectionPoint(coords: IBaseCoords, side: ConnectSide, gap?: number): IBaseCoords;
    render(): VNode;
    protected setDefaults(config: IProjectConfig): IProjectConfig;
}
