import { ItemConfig, ILineConfig, IDiagramConfig, IBaseCoords } from "../../types";
export declare function nearestLinkPath(link: ILineConfig, from: ItemConfig, to: ItemConfig, config: any): IBaseCoords[];
export declare function directLinkPath(link: ILineConfig, from: ItemConfig, to: ItemConfig, config: IDiagramConfig): void;
