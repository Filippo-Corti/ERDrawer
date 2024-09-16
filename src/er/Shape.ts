import Drawable from "../utils/Drawable";
import { Segment } from "../utils/Segment";
import Vector2D from "../utils/Vector2D";
import Connectable from "./Connectable";
import { ConnectionPoint } from "./ConnectionPoint";

export default abstract class Shape implements Connectable, Drawable {

    centerPoint: Vector2D;
    connectionPoints: ConnectionPoint[];
    label : string;
    labelFontSize : number;

    constructor(centerPoint: Vector2D, label : string) {
        this.centerPoint = centerPoint;
        this.label = label;
        this.connectionPoints = [];
        this.labelFontSize = this.calculateLabelSize();
        this.generateConnectionPoints();
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;

    abstract generateConnectionPoints() : void;

    abstract calculateLabelSize() : number;

    abstract getCorners() : Vector2D[];

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
        return found.value == null;
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

    getSegments() : Segment[] {
        const corners : Vector2D[] = this.getCorners();
        let segments : Segment[] = [];

        for(let i = 0; i < corners.length - 1; i++) {
            segments.push(Segment.fromVectors(corners[i], corners[i+1]));
        }
        segments.push(Segment.fromVectors(corners[corners.length - 1], corners[0]));

        return segments;
    }

    getSegmentByPoint(point: Vector2D): Segment {
        const segments = this.getSegments();

        for (const s of segments) {
            if (s.contains(point)) {
                return s;
            }
        }

        throw new Error("No Segment contains this point");
    }



}