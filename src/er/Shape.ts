import clone from "clone";
import Drawable from "../utils/Drawable";
import { Segment } from "../utils/Segment";
import { containsAny, doBrokenLinesIntersect } from "../utils/Utils";
import Vector2D from "../utils/Vector2D";
import Attribute from "./Attribute";
import Connectable from "./Connectable";
import { ConnectionPoint } from "./ConnectionPoint";
import Entity from "./Entity";
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

    // findConnectionPointFor(c: Connectable, closestSegment: boolean = true): ConnectionPoint {
    //     const segmentFromConnectable = Segment.fromVectors(c.centerPoint, this.centerPoint);
    //     const intersectionPoint: Vector2D = this.getPointByIntersectingSegment(segmentFromConnectable);
    //     const intersectionSegments: Segment[] = this.getSegmentsByPoint(intersectionPoint);

    //     this.findConnectionPointForA(c, closestSegment);
    //     do {
    //         const allConnPoints = this.getAllConnectionPoints();
    //         let minDist = Number.MAX_VALUE;
    //         let minPoint = null;
    //         for (const cp of allConnPoints) {
    //             if (cp.value !== null) continue;
    //             const currDist = cp.pos.distanceTo(intersectionPoint);
    //             if (currDist < minDist && (containsAny(intersectionSegments, this.getSegmentsByPoint(cp.pos)) || !closestSegment)) {
    //                 minDist = currDist;
    //                 minPoint = cp;
    //             }
    //         }
    //         if (minPoint) return minPoint;
    //     } while (this.reduceDeltasAndRegenerate());
    //     if (closestSegment)
    //         return this.findConnectionPointFor(c, false);
    //     throw new Error("Couldn't find a connection point");
    // }

    getConnectionLinePointsTo(c: Connectable): Vector2D[] {
        const myConnPoint = this.getCurrentConnectionPointFor(c);
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

    findConnectionPointFor(c: Connectable, noIntersections: boolean = true): ConnectionPoint {
        const connPointOnC: ConnectionPoint = (() => { try { return c.getCurrentConnectionPointFor(this) } catch { return { pos: c.centerPoint, value: null, outDirection: 0 } } })(); //Either the CP or the center point
        const connPointOnCWithOffset: Vector2D = Vector2D.sum(connPointOnC.pos, Vector2D.fromPolar(Relationship.STRAIGHT_SEGMENT_LENGTH, connPointOnC.outDirection));
        const intersectionPoint: Vector2D = this.getPointByIntersectingSegment(Segment.fromVectors(connPointOnCWithOffset, this.centerPoint));

        let possibleConnPoints = Array.from(this.connectionPoints.values());
        let shapeSegments = this.getSegments();

        // Delete CPs that pass through the Entity
        if (!(c instanceof Attribute)) {
            possibleConnPoints = possibleConnPoints.filter((cp) => {
                const connPointWithOffset: Vector2D = Vector2D.sum(cp.pos, Vector2D.fromPolar(Relationship.STRAIGHT_SEGMENT_LENGTH, cp.outDirection));
                const virtualEdge: Segment = Segment.fromVectors(connPointWithOffset, connPointOnCWithOffset);
                return !virtualEdge.intersectsAny(shapeSegments);
            })
        }

        // Sort CPs by value and distance to intersectionPoint
        const compareCPs = (a: ConnectionPoint, b: ConnectionPoint) => {
            if (!a.value && b.value) return -1;
            if (!b.value && a.value) return 1;
            if ((a.value instanceof Attribute) && !(b.value instanceof Attribute)) return 1;
            if (!(a.value instanceof Attribute) && (b.value instanceof Attribute)) return -1;

            // If both are of the same type (null, Attribute or Shape), sort by distance
            return a.pos.distanceTo(intersectionPoint) - b.pos.distanceTo(intersectionPoint);
        };

        possibleConnPoints.sort(compareCPs);

        //console.log(c, clone(possibleConnPoints));
        let i = 0;
        for (const cp of possibleConnPoints) {
            const connPointWithOffset: Vector2D = Vector2D.sum(cp.pos, Vector2D.fromPolar(Relationship.STRAIGHT_SEGMENT_LENGTH, cp.outDirection));
            const potentialLine: Vector2D[] = (c instanceof Attribute)
                ? [cp.pos, Vector2D.sum(connPointWithOffset, Vector2D.fromPolar(Attribute.measurePotentialLength(c.label) - Relationship.STRAIGHT_SEGMENT_LENGTH + 5, cp.outDirection))]
                : [cp.pos, connPointWithOffset, connPointOnCWithOffset, connPointOnC.pos];
            const anyIntersections: boolean = this.intersectsAnyConnectable(potentialLine);
            //console.log("Intersections?", anyIntersections, potentialLine);
            switch (true) {
                case cp.value == null:
                    //console.log(i);
                    if (!anyIntersections || !noIntersections) {
                        //console.log("Found a free connection point for", c, "found", cp, "no intersezioni: ", noIntersections);
                        return cp;
                    }
                    break;
                case cp.value instanceof Attribute:
                    //console.log(i);
                    if (!anyIntersections || !noIntersections) {
                        // Find available CP for a swap
                        for (const [_, otherCP] of this.connectionPoints) {
                            if (otherCP.value == null) {
                                [cp.value, otherCP.value] = [null, cp.value];
                                if (otherCP.value instanceof Attribute)
                                    otherCP.value.setConnectedPoint(otherCP);
                                //console.log("B Found an attribute connection point for", c, "found", cp, "no intersezioni: ", noIntersections);
                                return cp;
                            }
                        }
                    }
                    break;
                case cp.value instanceof Shape:
                    console.log("Found a shape but better if we don't");
                    break;
            }
            i++;
        }

        //console.log("deltasasss");
        if (this.reduceDeltasAndRegenerate())
            return this.findConnectionPointFor(c, noIntersections);

        if (noIntersections) {
            console.log("Need to intersect, unfortunately");
            return this.findConnectionPointFor(c, false);
        }

        throw new Error("Couldn't find a connection point");
    }

    intersectsAnyConnectable(line: Vector2D[]): boolean {
        return Array.from(this.connectionPoints.values()).some((cp) => {
            if (cp.value == null) return false;
            return doBrokenLinesIntersect(line, cp.value.getConnectionLinePointsTo(this))
        });
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