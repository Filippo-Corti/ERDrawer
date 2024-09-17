import Vector2D from "../utils/Vector2D";
import { ConnectionPoint } from "./ConnectionPoint";

export default interface Connectable {

    centerPoint : Vector2D;
    connectionPoints: Map<string, ConnectionPoint>;

    getAllConnectionPoints() : IterableIterator<ConnectionPoint>;

    isAConnectionPoint(p : Vector2D) : boolean;

    isConnectionPointOccupied(p : Vector2D) : boolean;

    occupyConnectionPoint(p : Vector2D, value : Connectable) : void;

    freeConnectionPoint(p : Vector2D) : void;

    getCurrentConnectionPointFor(c : Connectable) : Vector2D;

    findConnectionPointFor(c : Connectable) : Vector2D;

    isTheNearestConnectionPoint(p : Vector2D, connPoint : Vector2D) : boolean;

}