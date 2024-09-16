import Vector2D from "../utils/Vector2D";
import { ConnectionPoint } from "./ConnectionPoint";

export default interface Connectable {

    connectionPoints: ConnectionPoint[];

    getAllConnectionPoints() : IterableIterator<ConnectionPoint>;

    isAConnectionPoint(p : Vector2D) : boolean;

    isConnectionPointOccupied(p : Vector2D) : boolean;

    occupyConnectionPoint(p : Vector2D, value : Connectable) : void;

    freeConnectionPoint(p : Vector2D) : void;

    getConnectionPointFor(c : Connectable) : Vector2D;

}