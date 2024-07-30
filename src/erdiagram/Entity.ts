import { Node } from "../graph/Node";
import { Segment } from "../utils/Segment";
import { Vector2D } from "../utils/Vector2D";

export class Entity extends Node {

    halfSizeX : number = 50;
    halfSizeY : number = 30;
    connectionPoints : Map<Vector2D, boolean>;
    deltaConnectionPointsX : number = this.halfSizeX;
    deltaConnectionPointsY : number = this.halfSizeY;

    constructor(label: string, x: number, y: number, size : number = 30) {
        super(label, x, y, size);
        this.connectionPoints = new Map<Vector2D, boolean>;
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
            fontSize-=3;
        } while (ctx.measureText(this.label).width > (this.halfSizeX - PADDING) * 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.label, this.pos.x, this.pos.y);
    }

    // Returns 4 corners of the rectangle. Order is TR, TL, BR, BL.
    getRectangleBoundaries() : Vector2D[] {
        return [
            new Vector2D(this.pos.x - this.halfSizeX, this.pos.y - this.halfSizeY), //Top Right
            new Vector2D(this.pos.x + this.halfSizeX, this.pos.y - this.halfSizeY), //Top Left
            new Vector2D(this.pos.x + this.halfSizeX, this.pos.y + this.halfSizeY), //Bottom Right
            new Vector2D(this.pos.x - this.halfSizeX, this.pos.y + this.halfSizeY), //Bottom Left
        ];
    }

    // Returns 4 segments of the rectangle. Order is TOP - RIGHT - BOTTOM - LEFT.
    getRectangleSegments() : Segment[] {
        const corners = this.getRectangleBoundaries();
        return [
            Segment.fromVectors(corners[0], corners[1]),
            Segment.fromVectors(corners[1], corners[2]),
            Segment.fromVectors(corners[2], corners[3]),
            Segment.fromVectors(corners[3], corners[0]),
        ];
    }
 
    // Corners are included. Not in order
    getAllConnectionPoints() : Vector2D[] {
        const corners = this.getRectangleBoundaries();
        const connPoints = [];

        for (let x = corners[0].x; x <= corners[1].x; x += this.deltaConnectionPointsX) {
            connPoints.push(new Vector2D(x, corners[0].y));
            connPoints.push(new Vector2D(x, corners[2].y));
        }

        for (let y = corners[0].y; y <= corners[2].y; y += this.deltaConnectionPointsY) {
            connPoints.push(new Vector2D(corners[0].x, y));
            connPoints.push(new Vector2D(corners[1].x, y));
        }

        return connPoints;
    }

    // Occupies closest connection point to point, that is not already occupied.
    // It then returns the occupied connection point
    occupyClosestConnectionPoint(point : Vector2D) : Vector2D {
        const connPoints = this.getAllConnectionPoints();
        let minPoint = connPoints[0];
        let minDist = connPoints[0].distanceTo(point);

        for (let i = 1; i < connPoints.length; i++) {
            let dist = connPoints[i].distanceTo(point);
            if (dist < minDist && !this.connectionPoints.has(connPoints[i])) {
                minDist = dist;
                minPoint = connPoints[i];
            }
        }

        this.connectionPoints.set(minPoint, true);
        return minPoint;
    }

    // Returns the point where the edge and the rectangle constituting the entity intersect
    getEdgeIntersectingPoint(edgeSegment : Segment) : Vector2D | null {
        const segments = this.getRectangleSegments();

        for (let s of segments) {
            if (s.intersects(edgeSegment)) {
                return s.getIntersection(edgeSegment)!;
            }
        }
        return null;
    }

    // Occupies closest connection point to the Segment segment.
    // It then returns the occupied connection point
    occupyConnectionPointBySegment(segment : Segment) : Vector2D | null {
        const p = this.getEdgeIntersectingPoint(segment);
        if (!p) {
            return null;
        }
        return this.occupyClosestConnectionPoint(p);
    }


    clone() : Entity {
        const newNode = new Entity(this.label, this.pos.x, this.pos.y, this.size);
        newNode.disp = new Vector2D(this.disp.x, this.disp.y);
        return newNode;
    }
}