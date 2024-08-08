import { Node } from "../graph/Node";
import { Segment } from "../utils/Segment";
import { Vector2D } from "../utils/Vector2D";
import { Attribute } from "./Attribute";

export class Entity extends Node {

    halfSizeX: number = 50;
    halfSizeY: number = 30;
    connectionPoints: Map<string, boolean>; // Vector2D Hashcode to boolean
    deltaConnectionPointsX: number = this.halfSizeX;
    deltaConnectionPointsY: number = this.halfSizeY;

    attributes: Map<string, Attribute>;

    constructor(label: string, x: number, y: number, size: number = 30, attributes: string[] = []) {
        super(label, x, y, size);
        this.connectionPoints = new Map<string, boolean>;
        this.attributes = new Map<string, Attribute>;
        attributes.forEach(a => this.attributes.set(a, new Attribute(a, this.pos))); //Default position is center of the entity
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const PADDING = 15;

        //Draw Rectangle
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.pos.x - this.halfSizeX, this.pos.y - this.halfSizeY);
        ctx.lineTo(this.pos.x + this.halfSizeX, this.pos.y - this.halfSizeY);
        ctx.lineTo(this.pos.x + this.halfSizeX, this.pos.y + this.halfSizeY);
        ctx.lineTo(this.pos.x - this.halfSizeX, this.pos.y + this.halfSizeY);
        ctx.lineTo(this.pos.x - this.halfSizeX, this.pos.y - this.halfSizeY);
        ctx.fill();
        ctx.stroke();

        //Draw Label
        ctx.fillStyle = "black";
        let fontSize = this.size;
        do {
            ctx.font = fontSize + "px serif";
            fontSize -= 3;
        } while (ctx.measureText(this.label).width > (this.halfSizeX - PADDING) * 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.label, this.pos.x, this.pos.y);

        for (let [_, attribute] of this.attributes) {
            const point = this.findAttributePosition(attribute.startingPoint);
            const dir = this.getRectangleSegmentByPoint(point)!.getDirection();
            attribute.startingPoint = point;
            attribute.direction = dir + Math.PI / 2; //Direction is perpendicular to the segment
            attribute.draw(ctx);
        }
    }

    // Returns 4 corners of the rectangle. Order is TR, TL, BR, BL.
    getRectangleBoundaries(): Vector2D[] {
        return [
            new Vector2D(this.pos.x - this.halfSizeX, this.pos.y - this.halfSizeY), //Top Right
            new Vector2D(this.pos.x + this.halfSizeX, this.pos.y - this.halfSizeY), //Top Left
            new Vector2D(this.pos.x + this.halfSizeX, this.pos.y + this.halfSizeY), //Bottom Right
            new Vector2D(this.pos.x - this.halfSizeX, this.pos.y + this.halfSizeY), //Bottom Left
        ];
    }

    // Returns 4 segments of the rectangle. Order is TOP - RIGHT - BOTTOM - LEFT.
    getRectangleSegments(): Segment[] {
        const corners = this.getRectangleBoundaries();
        return [
            Segment.fromVectors(corners[0], corners[1]),
            Segment.fromVectors(corners[1], corners[2]),
            Segment.fromVectors(corners[2], corners[3]),
            Segment.fromVectors(corners[3], corners[0]),
        ];
    }

    // Returns the segment of the rectangle on which p stands on
    getRectangleSegmentByPoint(point: Vector2D): Segment | null {
        const segments = this.getRectangleSegments();

        for (const s of segments) {
            if (s.contains(point)) {
                return s;
            }
        }

        return null;
    }

    // Corners are not included. Not in order
    getAllConnectionPoints(): Vector2D[] {
        const corners = this.getRectangleBoundaries();
        const connPoints = [];

        // Vert Points 
        for (let y = corners[0].y + this.deltaConnectionPointsY; y < corners[2].y; y += this.deltaConnectionPointsY) {
            connPoints.push(new Vector2D(corners[0].x, y));
            connPoints.push(new Vector2D(corners[1].x, y));
        }

        // Horiz Points
        for (let x = corners[0].x + this.deltaConnectionPointsX; x < corners[1].x; x += this.deltaConnectionPointsX) {
            connPoints.push(new Vector2D(x, corners[0].y));
            connPoints.push(new Vector2D(x, corners[2].y));
        }

        return connPoints;
    }

    // Occupies the connection point that is not already occupied and the closest
    // to the point or the segment given.
    // It then returns the occupied connection point.
    // sameSegmentRequired = true requires the connection point to be on the same segment of the given point
    // or the intersection between the segment and the rectangle.
    occupyClosestConnectionPoint(point: Vector2D, sameSegmentRequired?: boolean): Vector2D | null;
    occupyClosestConnectionPoint(segment: Segment, sameSegmentRequired?: boolean): Vector2D | null;
    occupyClosestConnectionPoint(param: any, sameSegmentRequired: boolean = true): Vector2D | null {
        let point: Vector2D;
        if (param instanceof Vector2D) {
            point = param;
        } else {
            const p = this.getRectangleIntersectingPoint(param);
            if (!p) {
                throw new Error("No intersection found between segment and point");
            }
            point = p;
        }

        const connPoints = this.getAllConnectionPoints();
        const segmentOfPoint = this.getRectangleSegmentByPoint(point);
        if (!segmentOfPoint && sameSegmentRequired) {
            throw new Error("Point is not on any segment. sameSegmentRequired can't be true");
        }
        let minPoint = null;
        let minDist = Number.MAX_VALUE;

        for (let i = 0; i < connPoints.length; i++) {
            let dist = connPoints[i].distanceTo(point);
            if (dist < minDist && !this.connectionPoints.has(connPoints[i].toString())) {
                if (!sameSegmentRequired) {
                    if (!segmentOfPoint || segmentOfPoint.contains(connPoints[i])) {
                        minDist = dist;
                        minPoint = connPoints[i];
                    }
                } else {
                    if (!segmentOfPoint || segmentOfPoint.contains(connPoints[i])) {
                    }
                }
            }
        }

        if (!minPoint) {
            return null;
        }
        this.connectionPoints.set(minPoint.toString(), true);
        return minPoint;
    }

    // Returns the point where the edge and the rectangle of the entity intersect
    getRectangleIntersectingPoint(edgeSegment: Segment): Vector2D | null {
        const segments = this.getRectangleSegments();

        for (let s of segments) {
            if (s.intersects(edgeSegment)) {
                return s.getIntersection(edgeSegment)!;
            }
        }
        return null;
    }

    // Empty Connection Points map and reset deltas
    // It also resets attributes positions
    resetConnectionPoints(): void {
        this.connectionPoints = new Map<string, boolean>;
        this.deltaConnectionPointsX = this.halfSizeX;
        this.deltaConnectionPointsY = this.halfSizeY;
        this.attributes.forEach(a => {
            a.startingPoint = this.pos;
            a.direction = 0;
        });
    }

    // Sets the length between two connection points to half the previous value
    // Returns true if the deltas are not too small to get halved.
    reduceDeltas(): boolean {
        if (this.deltaConnectionPointsX <= 10 || this.deltaConnectionPointsY <= 10) {
            return false;
        }
        this.deltaConnectionPointsX /= 2;
        this.deltaConnectionPointsY /= 2;
        return true;
    }

    addAttribute(label: string, filledPoint: boolean = false) {
        this.attributes.set(label, new Attribute(label, this.pos, filledPoint));
    }

    findEdgeConnectionPosition(edgeSegment : Segment) : Vector2D {
        const deltaX = this.deltaConnectionPointsX;
        const deltaY = this.deltaConnectionPointsY;
        let sameSegmentRequired = true;
        do {
            const cp = this.occupyClosestConnectionPoint(edgeSegment, sameSegmentRequired);
            if (cp) return cp;
            const ok = this.reduceDeltas();
            if (!ok) {
                if (sameSegmentRequired) {
                    sameSegmentRequired = false;
                    this.deltaConnectionPointsX = deltaX;
                    this.deltaConnectionPointsY = deltaY;
                }
                else 
                    throw new Error("Couldn't place the attribute in any possible way");
            }
        } while (true);
    }

    // Finds and Returns a new Attribute starting position.
    findAttributePosition(attrCurrPosition: Vector2D): Vector2D {
        const deltaX = this.deltaConnectionPointsX;
        const deltaY = this.deltaConnectionPointsY;
        let sameSegmentRequired = false;
        do {
            const cp = this.occupyClosestConnectionPoint(attrCurrPosition, sameSegmentRequired);
            if (cp) return cp;
            const ok = this.reduceDeltas();
            if (!ok) {
                if (sameSegmentRequired) {
                    sameSegmentRequired = false;
                    this.deltaConnectionPointsX = deltaX;
                    this.deltaConnectionPointsY = deltaY;
                }
                else 
                    throw new Error("Couldn't place the attribute in any possible way");
            }
        } while (true);
    }

    // Labels list contains attributes and other entities' names
    setPrimaryKey(labelsList: string[]): void {
        for (const label of labelsList) {
            if (this.attributes.has(label)) {
                this.attributes.get(label)!.filledPoint = true;
            }
        }
    }

    clone(): Node {
        const newNode = new Entity(this.label, this.pos.x, this.pos.y, this.size);
        newNode.disp = new Vector2D(this.disp.x, this.disp.y);
        newNode.deltaConnectionPointsX = this.deltaConnectionPointsX;
        newNode.deltaConnectionPointsY = this.deltaConnectionPointsY;
        const newConnPoints = new Map<string, boolean>;
        this.connectionPoints.forEach((v, k) => newConnPoints.set(k, v));
        newNode.connectionPoints = newConnPoints;
        const newAttributes = new Map<string, Attribute>;
        this.attributes.forEach((a) => newAttributes.set(a.label, a.clone()));
        newNode.attributes = newAttributes;
        return newNode;
    }
}