import Drawable from "../utils/Drawable";
import { Segment } from "../utils/Segment";
import { containsAny } from "../utils/Utils";
import Vector2D from "../utils/Vector2D";
import Connectable from "./Connectable";
import { ConnectionPoint } from "./ConnectionPoint";

export default abstract class Shape implements Connectable, Drawable {

    centerPoint: Vector2D;
    connectionPoints: ConnectionPoint[];
    label: string;
    labelFontSize: number;

    deltaX: number;
    deltaY: number;

    constructor(centerPoint: Vector2D, label: string, deltaX: number, deltaY: number) {
        this.centerPoint = centerPoint;
        this.label = label;
        this.deltaX = deltaX;
        this.deltaY = deltaY;
        this.connectionPoints = [];
        this.labelFontSize = this.calculateLabelSize();
        this.generateConnectionPoints();
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;

    abstract generateConnectionPoints(): void;

    abstract calculateLabelSize(): number;

    abstract getCorners(): Vector2D[];

    abstract isTheNearestConnectionPoint(p: Vector2D, connPoint: Vector2D): boolean;

    getAllConnectionPoints(): IterableIterator<ConnectionPoint> {
        return this.connectionPoints[Symbol.iterator]();
    }

    isAConnectionPoint(p: Vector2D): boolean {
        return this.connectionPoints.some((cp) => cp.pos.equals(p));
    }

    isConnectionPointOccupied(p: Vector2D): boolean {
        const found: ConnectionPoint | undefined = this.connectionPoints.find((cp) => cp.pos.equals(p));
        if (!found) {
            throw new Error("P is not a valid Connection Point for this shape");
        }
        return found.value == null;
    }

    occupyConnectionPoint(p: Vector2D, value: Connectable): void {
        const found: ConnectionPoint | undefined = this.connectionPoints.find((cp) => cp.pos.equals(p));
        if (!found) {
            throw new Error("P is not a valid Connection Point for this shape");
        }
        found.value = value;
    }

    freeConnectionPoint(p: Vector2D): void {
        const found: ConnectionPoint | undefined = this.connectionPoints.find((cp) => cp.pos.equals(p));
        if (!found) {
            throw new Error("P is not a valid Connection Point for this shape");
        }
        found.value = null;
    }

    getCurrentConnectionPointFor(c: Connectable): Vector2D {
        const found: ConnectionPoint | undefined = this.connectionPoints.find((cp) => cp.value == c);
        if (!found) {
            throw new Error("P is not a valid Connection Point for this shape");
        }
        return found.pos;
    }

    findConnectionPointFor(c: Connectable): Vector2D {
        const segmentFromConnectable = Segment.fromVectors(c.centerPoint, this.centerPoint);
        const intersectionPoint: Vector2D = this.getPointByIntersectingSegment(segmentFromConnectable);
        const intersectionSegments: Segment[] = this.getSegmentsByPoint(intersectionPoint);

        do {
            const allConnPoints = this.getAllConnectionPoints();
            let minDist = Number.MAX_VALUE;
            let minPoint = null;
            for (const cp of allConnPoints) {
                if (cp.value !== null) continue;
                const currDist = cp.pos.distanceTo(intersectionPoint);
                if (currDist < minDist && containsAny(intersectionSegments, this.getSegmentsByPoint(cp.pos))) {
                    minDist = currDist;
                    minPoint = cp.pos;
                }
            }
            if (minPoint) return minPoint;
        } while (this.reduceDeltasAndRegenerate());
        throw new Error("Couldn't find a connection point");
    }


    getSegments(): Segment[] {
        const corners: Vector2D[] = this.getCorners();
        let segments: Segment[] = [];

        for (let i = 0; i < corners.length - 1; i++) {
            segments.push(Segment.fromVectors(corners[i], corners[i + 1]));
        }
        segments.push(Segment.fromVectors(corners[corners.length - 1], corners[0]));

        return segments;
    }

    getSegmentsByPoint(point: Vector2D): Segment[] {
        const segments = this.getSegments();
        const containingSegments : Segment[] = [];

        for (const s of segments) {
            if (s.contains(point)) {
                containingSegments.push(s);
            }
        }
        return containingSegments;
    }

    getPointByIntersectingSegment(segment: Segment): Vector2D {
        const segments = this.getSegments();

        for (let s of segments) {
            if (s.intersects(segment)) {
                const intersection = s.getIntersection(segment);
                if (!intersection) break;
                return intersection;
            }
        }

        throw new Error("No intersection between the shape and the given segment");
    }

    reduceDeltasAndRegenerate(): boolean {
        if (this.deltaX < 15 || this.deltaY < 10) return false;
        this.deltaX /= 2;
        this.deltaY /= 2;

        const oldConnPoints = this.connectionPoints;
        this.generateConnectionPoints();
        for (const oldP of oldConnPoints) {
            if (oldP.value !== null) {
                this.occupyConnectionPoint(oldP.pos, oldP.value);
            }
        }

        return true;
    }


}