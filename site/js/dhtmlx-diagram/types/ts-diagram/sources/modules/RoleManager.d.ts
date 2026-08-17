import { IDataItem } from "../../../ts-data";
import { Role } from "../types";
export declare class RoleManager {
    private roleMap;
    private defaultRole;
    constructor();
    /**
     * Registers one or more item type strings to a specific {@link Role}.
     * @param type - A single type string or an array of type strings to register.
     * @param role - The role to assign to the given type(s).
     */
    registerRole(type: string | string[], role: Role): void;
    /**
     * Assigns the `$role` property to a data item based on its `type`.
     * If the type is not registered, the default role (`"shape"`) is used.
     * @param item - The data item to assign a role to.
     */
    assignRole(item: IDataItem): void;
    private _init;
}
