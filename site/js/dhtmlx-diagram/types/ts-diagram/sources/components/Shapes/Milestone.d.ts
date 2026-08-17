import { VNode } from "../../../../ts-common/dom";
import { BaseShape } from "./BaseShape";
import { IMilestoneShapeConfig } from "../../types";
export declare class Milestone extends BaseShape {
    config: IMilestoneShapeConfig;
    constructor(config: IMilestoneShapeConfig, params?: IMilestoneShapeConfig);
    render(): VNode;
    protected setDefaults(config: IMilestoneShapeConfig, defaults?: IMilestoneShapeConfig): IMilestoneShapeConfig;
}
