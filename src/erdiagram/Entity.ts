import { Graph } from "../graph/Graph";
import { Node } from "../graph/Node";
import { Segment } from "../utils/Segment";
import { ConnectionPoint, Random } from "../utils/Utils";
import { Vector2D } from "../utils/Vector2D";
import { Attribute } from "./Attribute";

export class Entity extends Node {

    halfSizeX: number = 50;
    halfSizeY: number = 30;
    deltaConnectionPointsX: number = this.halfSizeX;
    deltaConnectionPointsY: number = this.halfSizeY;
    connectionPoints: ConnectionPoint[]; // Vector2D Hashcode to boolean
    attributes: Map<string, Attribute>;

    constructor(graph: Graph, label: string, x: number, y: number, size: number = 30, attributes: string[] = []) {
        super(graph, label, x, y, size);
        this.connectionPoints = [];
        const connPoints = this.getAllConnectionPoints();
        connPoints.forEach((p) => this.connectionPoints.push({ p: p, empty: true }));
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
            const point = this.findAttributePosition(attribute.totalLength());
            if (!point) {
                throw new Error("Couldn't position attribute");
            }
            const dir = this.getRectangleSegmentByPoint(point)!.getDirection();
            attribute.startingPoint = point;
            attribute.direction = dir + Math.PI / 2; //Direction is perpendicular to the segment
            attribute.draw(ctx);
        }
    }

    // Returns 4 corners of the rectangle. Order is TL, TR, BR, BL.
    getRectangleBoundaries(): Vector2D[] {
        return [
            new Vector2D(this.pos.x - this.halfSizeX, this.pos.y - this.halfSizeY), //Top Left
            new Vector2D(this.pos.x + this.halfSizeX, this.pos.y - this.halfSizeY), //Top Right
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

    // Corners are not included. In order around the rectangle
    getAllConnectionPoints(): Vector2D[] {
        const corners = this.getRectangleBoundaries();
        const connPoints = [];

        // Top Points (Left to Right)
        for (let x = corners[0].x + this.deltaConnectionPointsX; x < corners[1].x; x += this.deltaConnectionPointsX) {
            connPoints.push(new Vector2D(x, corners[0].y));
        }

        // Right Points (Top to Bottom)
        for (let y = corners[1].y + this.deltaConnectionPointsY; y < corners[2].y; y += this.deltaConnectionPointsY) {
            connPoints.push(new Vector2D(corners[1].x, y));
        }

        // Bottom Points (Right to Left) 
        for (let x = corners[2].x - this.deltaConnectionPointsX; x > corners[3].x; x -= this.deltaConnectionPointsX) {
            connPoints.push(new Vector2D(x, corners[2].y));
        }

        // Left Points (Bottom to Top)
        for (let y = corners[3].y - this.deltaConnectionPointsY; y > corners[0].y; y -= this.deltaConnectionPointsY) {
            connPoints.push(new Vector2D(corners[3].x, y));
        }

        return connPoints;
    }

    isAConnectionPoint(p: Vector2D): boolean {
        return this.connectionPoints.find((cp) => cp.p.x == p.x && cp.p.y == p.y) !== undefined;
    }

    isConnectionPointOccupied(p: Vector2D): boolean {
        const found = this.connectionPoints.find((cp) => cp.p.x == p.x && cp.p.y == p.y);
        if (!found) {
            throw new Error("P is not a connection point");
        }
        return !found.empty;
    }

    setConnectionPoint(p: Vector2D, empty: boolean): void {
        const found = this.connectionPoints.find((cp) => cp.p.x == p.x && cp.p.y == p.y);
        if (!found) {
            throw new Error("P is not a connection point");
        }
        found.empty = empty;
    }

    // Empty Connection Points map and reset deltas
    // It also resets attributes positions
    resetConnectionPoints(): void {
        this.connectionPoints = [];
        const connPoints = this.getAllConnectionPoints();
        connPoints.forEach((p) => this.connectionPoints.push({ p: p, empty: true }));
        this.attributes.forEach(a => {
            a.startingPoint = this.pos;
            a.direction = 0;
        });
        this.resetDeltas();
    }

    addAttribute(label: string, filledPoint: boolean = false) {
        this.attributes.set(label, new Attribute(label, this.pos, filledPoint));
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

        const connPoints = this.connectionPoints;
        Random.shuffle(connPoints); // Shuffling for more diversity in the results (and better chance of a 0 crossing layout)
        const segmentOfPoint = this.getRectangleSegmentByPoint(point);
        if (!segmentOfPoint && sameSegmentRequired) {
            throw new Error("Point is not on any segment. sameSegmentRequired can't be true");
        }
        let minPoint = null;
        let minDist = Number.MAX_VALUE;

        for (let i = 0; i < connPoints.length; i++) {
            let dist = connPoints[i].p.distanceTo(point);
            if (dist < minDist && connPoints[i].empty) {
                if (!sameSegmentRequired) {
                    if (!segmentOfPoint || segmentOfPoint.contains(connPoints[i].p)) {
                        minDist = dist;
                        minPoint = connPoints[i].p;
                    }
                } else {
                    if (segmentOfPoint!.contains(connPoints[i].p)) {
                        minDist = dist;
                        minPoint = connPoints[i].p;
                    }
                }
            }
        }

        if (!minPoint) {
            return null;
        }
        this.setConnectionPoint(minPoint, false);
        return minPoint;
    }

    resetDeltas(): void {
        this.deltaConnectionPointsX = this.halfSizeX;
        this.deltaConnectionPointsY = this.halfSizeY;
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

    // Sets the length between two connection points to half the previous value
    // Returns true if the deltas are not too small to get halved.
    reduceDeltas(): boolean {
        if (this.deltaConnectionPointsX <= 10 || this.deltaConnectionPointsY <= 10) {
            return false;
        }
        this.deltaConnectionPointsX /= 2;
        this.deltaConnectionPointsY /= 2;

        const newConnectionPoints: ConnectionPoint[] = [];
        this.getAllConnectionPoints().forEach((p) => {
            let empty = true;
            if (this.isAConnectionPoint(p) && this.isConnectionPointOccupied(p)) {
                empty = false;
            }
            newConnectionPoints.push({ p: p, empty: empty })
        });
        this.connectionPoints = newConnectionPoints;
        return true;
    }

    findEdgeConnectionPosition(edgeSegment: Segment): Vector2D {
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
    findAttributePosition(attrSegmentLength: number): Vector2D | null {
        const connectingEdges = this.graph.getEdgesByNode(this.label);
        do {
            const connectionPoints = this.connectionPoints;
            Random.shuffle(connectionPoints);
            // Search Connection Point
            for (const cp of connectionPoints) {
                if (!cp.empty) continue;
                // Build Attribute Segment
                const diffVect = Vector2D.fromPolar(attrSegmentLength, this.getRectangleSegmentByPoint(cp.p)!.getDirection() + Math.PI / 2);
                const attrSegment = Segment.fromVectors(
                    cp.p,
                    Vector2D.sum(cp.p, diffVect)
                );
                //Check for Intersections
                let intersects = false;
                for (const edge of connectingEdges) {
                    if (edge.intersectsSegment(attrSegment)) {
                        intersects = true;
                        break;
                    }
                }
                if (!intersects) {
                    this.setConnectionPoint(cp.p, false);
                    return cp.p;
                }
            }
            const ok = this.reduceDeltas();
            if (!ok) {
                return this.occupyClosestConnectionPoint(this.pos, false); //If you can't reduce any more, just pick a random one.
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
        const newNode = new Entity(this.graph, this.label, this.pos.x, this.pos.y, this.size);
        newNode.disp = new Vector2D(this.disp.x, this.disp.y);
        newNode.deltaConnectionPointsX = this.deltaConnectionPointsX;
        newNode.deltaConnectionPointsY = this.deltaConnectionPointsY;
        const newConnPoints: ConnectionPoint[] = [];
        this.connectionPoints.forEach((cp) => newConnPoints.push({ p: cp.p, empty: cp.empty }));
        newNode.connectionPoints = newConnPoints;
        const newAttributes = new Map<string, Attribute>;
        this.attributes.forEach((a) => newAttributes.set(a.label, a.clone()));
        newNode.attributes = newAttributes;
        return newNode;
    }
}