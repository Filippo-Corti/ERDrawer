import Drawable from "../utils/Drawable";
import { Segment } from "../utils/Segment";
import { doBrokenLinesIntersect } from "../utils/Utils";
import Vector2D from "../utils/Vector2D";
import Attribute from "./Attribute";
import Connectable from "./Connectable";
import { ConnectionPoint } from "./ConnectionPoint";
import Relationship from "./Relationship";

export default abstract class Shape implements Connectable, Drawable {

    centerPoint: Vector2D;
    connectionPoints: Map<string, ConnectionPoint>;
    label: string;
    labelFontSize: number;

    deltaX: number;
    deltaY: number;

    constructor(centerPoint: Vector2D, label: string, deltaX: number, deltaY: number) {
        this.centerPoint = centerPoint;
        this.label = label;
        this.deltaX = deltaX;
        this.deltaY = deltaY;
        this.connectionPoints = new Map<string, ConnectionPoint>();
        this.labelFontSize = this.calculateLabelSize();
        this.generateConnectionPoints();
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;

    abstract generateConnectionPoints(): void;

    abstract calculateLabelSize(): number;

    abstract getCorners(): Vector2D[];

    abstract isTheNearestConnectionPoint(p: Vector2D, connPoint: Vector2D): boolean;

    getAllConnectionPoints(): IterableIterator<ConnectionPoint> {
        return this.connectionPoints.values();
    }

    isAConnectionPoint(p: Vector2D): boolean {
        return this.connectionPoints.has(p.toString())
    }

    isConnectionPointOccupied(p: Vector2D): boolean {
        const found: ConnectionPoint | undefined = this.connectionPoints.get(p.toString());
        if (!found) {
            throw new Error("P is not a valid Connection Point for this shape");
        }
        return found.value == null;
    }

    occupyConnectionPoint(p: Vector2D, value: Connectable): void {
        const found: ConnectionPoint | undefined = this.connectionPoints.get(p.toString());
        if (!found) {
            throw new Error("P is not a valid Connection Point for this shape");
        }
        found.value = value;
    }

    freeConnectionPoint(p: Vector2D): void {
        const found: ConnectionPoint | undefined = this.connectionPoints.get(p.toString());
        if (!found) {
            throw new Error("P is not a valid Connection Point for this shape");
        }
        found.value = null;
    }

    getCurrentConnectionPointFor(c: Connectable): ConnectionPoint {
        const found: ConnectionPoint | undefined = Array.from(this.connectionPoints.values()).find((cp) => cp.value == c);
        if (!found) {
            throw new Error("P is not a valid Connection Point for this shape");
        }
        return found;
    }

    getPreviousConnectionPoint(p: Vector2D): ConnectionPoint {
        let prev: ConnectionPoint | null = null;
        for (let [key, value] of this.connectionPoints) {
            if (key === p.toString())
                return (prev) ? prev : Array.from(this.connectionPoints).pop()![1];

            prev = value;
        }
        throw new Error("P is not a Connection Point");
    }

    getNextConnectionPoint(p: Vector2D): ConnectionPoint {
        let found: boolean = false;
        for (let [key, value] of this.connectionPoints) {
            if (found)
                return value;

            if (key === p.toString())
                found = true;
        }
        if (found)
            return Array.from(this.connectionPoints)[0][1];

        throw new Error("P is not a Connection Point");
    }

    getConnectionLinePointsTo(c: Connectable, startingConnPoint?: ConnectionPoint): Vector2D[] {
        const myConnPoint = startingConnPoint || this.getCurrentConnectionPointFor(c);
        const myCorner = Vector2D.sum(myConnPoint.pos, Vector2D.fromPolar(Relationship.STRAIGHT_SEGMENT_LENGTH, myConnPoint.outDirection));
        const theirConnPoint = c.getCurrentConnectionPointFor(this);
        const theirCorner = Vector2D.sum(theirConnPoint.pos, Vector2D.fromPolar(Relationship.STRAIGHT_SEGMENT_LENGTH, theirConnPoint.outDirection));
        return [
            myConnPoint.pos,
            myCorner,
            theirCorner,
            theirConnPoint.pos
        ];
    }

    findConnectionPointFor(c: Connectable, dontIntersectOption: boolean = true): ConnectionPoint {
        const connPointOnC: ConnectionPoint = (() => { try { return c.getCurrentConnectionPointFor(this) } catch { return { pos: c.centerPoint, value: null, outDirection: 0 } } })(); //Either the CP or the center point
        const connPointOnCWithOffset: Vector2D = Vector2D.sum(connPointOnC.pos, Vector2D.fromPolar(Relationship.STRAIGHT_SEGMENT_LENGTH, connPointOnC.outDirection));
        const intersectionPoint: Vector2D = this.getPointByIntersectingSegment(Segment.fromVectors(connPointOnCWithOffset, this.centerPoint));

        let possibleConnPoints = Array.from(this.connectionPoints.values());
        let shapeSegments = this.getSegments();

        // Delete CPs that pass through the Entity
        if (!(c instanceof Attribute)) {
            possibleConnPoints = possibleConnPoints.filter((cp) => {
                const connPointWithOffset: Vector2D = Vector2D.sum(cp.pos, Vector2D.fromPolar(Relationship.STRAIGHT_SEGMENT_LENGTH, cp.outDirection));
                return !Segment.fromVectors(connPointWithOffset, connPointOnCWithOffset).intersectsAny(shapeSegments);
            });
        }

        // Sort CPs by value and distance to intersectionPoint
        possibleConnPoints.sort(Shape.getConnectionPointsCompareFunction(intersectionPoint));

        // Find CP
        for (const currentCP of possibleConnPoints) {
            const connPointWithOffset: Vector2D = Vector2D.sum(currentCP.pos, Vector2D.fromPolar(Relationship.STRAIGHT_SEGMENT_LENGTH, currentCP.outDirection));
            const potentialLine: Vector2D[] = (c instanceof Attribute)
                ? [currentCP.pos, Vector2D.sum(connPointWithOffset, Vector2D.fromPolar(Attribute.measurePotentialLength(c.label) - Relationship.STRAIGHT_SEGMENT_LENGTH + 5, currentCP.outDirection))]
                : [currentCP.pos, connPointWithOffset, connPointOnCWithOffset, connPointOnC.pos];

            switch (true) {
                case currentCP.value == null:
                    let potentialConnPoints: ConnectionPoint[] = Array.from(this.connectionPoints.values()).map((cp) => {
                        let newValue = cp.value;
                        if (cp == currentCP) newValue = null;
                        return { pos: cp.pos, value: newValue, outDirection: cp.outDirection };
                    });
                    const anyIntersections: boolean = this.anyIntersectionBetweenConnectables(potentialConnPoints, potentialLine);
                    if (!anyIntersections || !dontIntersectOption) return currentCP;
                    break;
                case currentCP.value instanceof Attribute:
                    // Find available CP for a swap
                    for (const [_, otherCP] of this.connectionPoints) {
                        if (otherCP.value) continue;
                        let potentialConnPoints = Array.from(this.connectionPoints.values()).map((cp) => {
                            let newValue = cp.value;
                            if (cp == otherCP) newValue = currentCP.value;
                            if (cp == currentCP) newValue = null;
                            return { pos: cp.pos, value: newValue, outDirection: cp.outDirection };
                        });
                        const anyIntersections: boolean = this.anyIntersectionBetweenConnectables(potentialConnPoints, potentialLine);
                        if (!anyIntersections || !dontIntersectOption) {
                            [currentCP.value, otherCP.value] = [null, currentCP.value];
                            if (otherCP.value instanceof Attribute)
                                otherCP.value.setConnectedPoint(otherCP);
                            return currentCP;
                        }
                    }
                    break;
            }
        }

        if (this.reduceDeltasAndRegenerate())
            return this.findConnectionPointFor(c, dontIntersectOption);

        if (dontIntersectOption) {
            console.log("Need to intersect, unfortunately");
            //console.log("Tried to connect", c.label, "to", this.label);
            return this.findConnectionPointFor(c, false);
        }

        throw new Error("Couldn't find a connection point");
    }

    static getConnectionPointsCompareFunction(referencePoint: Vector2D) {
        return (a: ConnectionPoint, b: ConnectionPoint) => {
            const firstGroupA = (!a.value || a.value instanceof Attribute);
            const firstGroupB = (!b.value || b.value instanceof Attribute);
            if (firstGroupA && !firstGroupB) return -1;
            if (!firstGroupA && firstGroupB) return 1;

            // If both are of the same type, sort by distance
            return a.pos.distanceTo(referencePoint) - b.pos.distanceTo(referencePoint);
        };
    }

    anyIntersectionBetweenConnectables(connectionPoints: ConnectionPoint[], newLine: Vector2D[]): boolean {
        const CPsOfRelationships = connectionPoints.filter((cp) => cp.value instanceof Relationship);
        let allLines = [newLine, ...CPsOfRelationships.map((cp) => cp.value!.getConnectionLinePointsTo(this))];
        for (const line of allLines) {
            const intersections = connectionPoints.some((cp) => {
                if (cp.value == null) return false;
                if (cp.pos.equals(line[0]) || cp.pos.equals(line[line.length - 1])) return false;
                return doBrokenLinesIntersect(line, cp.value.getConnectionLinePointsTo(this, cp))
            });
            if (intersections) return true;
        }
        return false;
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
        const containingSegments: Segment[] = [];

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
        const canDivideX: boolean = (this.deltaX >= 15);
        const canDivideY: boolean = (this.deltaY >= 20);
        if (!(canDivideX || canDivideY)) return false;

        if (canDivideX)
            this.deltaX /= 2;
        if (canDivideY)
            this.deltaY /= 2;

        const oldConnPoints = this.connectionPoints;
        this.generateConnectionPoints();
        for (const [_, oldP] of oldConnPoints) {
            if (oldP.value !== null) {
                this.occupyConnectionPoint(oldP.pos, oldP.value);
            }
        }

        return true;
    }

    updateCenterPoint(newCenterPoint: Vector2D): void {
        if (this.centerPoint.equals(newCenterPoint)) return;

        const centerPointsDiff = Vector2D.sum(newCenterPoint, this.centerPoint.negative());
        const newConnectionPoints: Map<string, ConnectionPoint> = new Map<string, ConnectionPoint>();

        for (const [_, oldCP] of this.connectionPoints) {
            const newPoint = Vector2D.sum(oldCP.pos, centerPointsDiff);
            oldCP.pos = newPoint;
            newConnectionPoints.set(newPoint.toString(), oldCP)
        }

        this.centerPoint = newCenterPoint;
        this.connectionPoints = newConnectionPoints;
    }



}