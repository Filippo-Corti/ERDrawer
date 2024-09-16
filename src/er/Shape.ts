import Drawable from "../utils/Drawable";
import Vector2D from "../utils/Vector2D";
import Connectable from "./Connectable";
import { ConnectionPoint } from "./ConnectionPoint";

export default abstract class Shape implements Connectable, Drawable {

    centerPoint: Vector2D;
    connectionPoints: ConnectionPoint[];

    constructor(centerPoint: Vector2D) {
        this.centerPoint = centerPoint;
        this.connectionPoints = [];
        this.generateConnectionPoints();
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;

    abstract generateConnectionPoints() : void;

    getAllConnectionPoints(): Iterator<ConnectionPoint> {
        return this.connectionPoints[Symbol.iterator]();
    }

    isAConnectionPoint(p: Vector2D): boolean {
        return this.connectionPoints.some((cp) => cp.pos == p);
    }

    isConnectionPointOccupied(p: Vector2D): boolean {
        const found: ConnectionPoint | undefined = this.connectionPoints.find((cp) => cp.pos == p);
        if (!found) {
            throw new Error("P is not a valid Connection Point for this shape");
        }
        return found.isEmpty();
    }

    occupyConnectionPoint(p: Vector2D, value: Connectable): void {
        const found: ConnectionPoint | undefined = this.connectionPoints.find((cp) => cp.pos == p);
        if (!found) {
            throw new Error("P is not a valid Connection Point for this shape");
        }
        found.value = value;
    }

    freeConnectionPoint(p: Vector2D): void {
        const found: ConnectionPoint | undefined = this.connectionPoints.find((cp) => cp.pos == p);
        if (!found) {
            throw new Error("P is not a valid Connection Point for this shape");
        }
        found.value = null;
    }



}