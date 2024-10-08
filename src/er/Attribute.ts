import Drawable from "../utils/Drawable";
import Vector2D from "../utils/Vector2D";
import Connectable from "./Connectable";
import { ConnectionPoint } from "./ConnectionPoint";
import Relationship from "./Relationship";

export default class Attribute implements Connectable, Drawable {

    static CIRCLE_SIZE = 5;
    static LABEL_FONTSIZE: number = 15;
    static SEGMENT_LENGTH: number = Relationship.STRAIGHT_SEGMENT_LENGTH;

    centerPoint: Vector2D;
    connectionPoints: Map<string, ConnectionPoint>;
    label: string;
    connected: Connectable | null = null;
    segmentDirection: number = 0;
    filledPoint: boolean;

    constructor(label: string, filledPoint: boolean = false) {
        this.centerPoint = new Vector2D(-1, -1); //Temporarily
        this.label = label;
        this.filledPoint = filledPoint;
        this.connectionPoints = new Map<string, ConnectionPoint>();
        this.connectionPoints.set(this.centerPoint.toString(), { pos: this.centerPoint, value: null, outDirection: 0 });
    }

    static measurePotentialLength(label: string): number {
        const ctx = document.createElement("canvas").getContext("2d")!; // Fictionary context to measure label length
        ctx.font = Attribute.LABEL_FONTSIZE + "px serif";
        return Attribute.SEGMENT_LENGTH + Attribute.CIRCLE_SIZE + 3 + ctx.measureText(label).width;
    }

    linkToConnectable(c: Connectable): void {
        this.occupyConnectionPoint(this.findConnectionPointFor(c).pos, c);
        this.connected = c;

        const found = c.getCurrentConnectionPointFor(this);
        this.setConnectedPoint(found);
    }

    setConnectedPoint(cp: ConnectionPoint): void {
        this.centerPoint = cp.pos;
        this.segmentDirection = (cp.outDirection + 2 * Math.PI) % (2 * Math.PI);
        this.connectionPoints = new Map<string, ConnectionPoint>();
        this.connectionPoints.set(cp.pos.toString(), { pos: cp.pos, value: this, outDirection: cp.outDirection });
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const deltaVector = Vector2D.fromPolar(Attribute.SEGMENT_LENGTH, this.segmentDirection);
        const endPoint = Vector2D.sum(this.centerPoint, deltaVector);

        // Draw Line
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.centerPoint.x, this.centerPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();


        // Draw Point
        ctx.fillStyle = (this.filledPoint) ? "black" : "white";
        ctx.beginPath();
        ctx.arc(endPoint.x, endPoint.y, Attribute.CIRCLE_SIZE, 0, 2 * Math.PI, true);
        ctx.fill();
        ctx.stroke();

        // Draw Text
        ctx.save();
        ctx.fillStyle = "black";
        ctx.textBaseline = "middle";
        ctx.font = Attribute.LABEL_FONTSIZE + "px serif";
        ctx.translate(endPoint.x, endPoint.y);
        if (this.segmentDirection > Math.PI / 2 && this.segmentDirection < 3 / 2 * Math.PI) {
            ctx.rotate(this.segmentDirection + Math.PI);
            ctx.textAlign = "end";
            ctx.fillText(this.label, - (Attribute.CIRCLE_SIZE + 3), 0);
        } else {
            ctx.rotate(this.segmentDirection);
            ctx.textAlign = "start";
            ctx.fillText(this.label, Attribute.CIRCLE_SIZE + 3, 0);
        }
        ctx.restore();
    }

    getAllConnectionPoints(): IterableIterator<ConnectionPoint> {
        return this.connectionPoints.values();
    }

    isAConnectionPoint(p: Vector2D): boolean {
        return (p.equals(this.centerPoint));
    }

    isConnectionPointOccupied(p: Vector2D): boolean {
        if (!p.equals(this.centerPoint))
            throw new Error("P is not a valid Connection Point for this attribute")

        return this.connected !== null;
    }

    occupyConnectionPoint(p: Vector2D, value: Connectable): void {
        if (!p.equals(this.centerPoint))
            throw new Error("P is not a valid Connection Point for this attribute")

        this.connectionPoints.get(this.centerPoint.toString())!.value = value;
    }

    freeConnectionPoint(p: Vector2D): void {
        if (!p.equals(this.centerPoint))
            throw new Error("P is not a valid Connection Point for this attribute")

        this.connectionPoints.get(this.centerPoint.toString())!.value = null;
    }

    getCurrentConnectionPointFor(c: Connectable): ConnectionPoint {
        if (this.connected != c)
            throw new Error("P is not a valid Connection Point for this shape");

        return this.connectionPoints.get(this.centerPoint.toString())!;
    }

    findConnectionPointFor(_c: Connectable): ConnectionPoint {
        if (this.connectionPoints.get(this.centerPoint.toString())!.value !== null)
            throw new Error("Couldn't find a connection point");
        return this.connectionPoints.get(this.centerPoint.toString())!;
    }

    isTheNearestConnectionPoint(_p: Vector2D, _connPoint: Vector2D): boolean {
        return true;
    }

    getPreviousConnectionPoint(_p: Vector2D): ConnectionPoint {
        return this.connectionPoints.get(this.centerPoint.toString())!;
    }

    getNextConnectionPoint(_p: Vector2D): ConnectionPoint {
        return this.connectionPoints.get(this.centerPoint.toString())!;
    }

    getConnectionLinePointsTo(c: Connectable, startingConnPoint? : ConnectionPoint): Vector2D[] {
        if (c != this.connected) throw new Error("This Attribute is not connected to " + c);
        const connPoint = startingConnPoint || this.connectionPoints.get(this.centerPoint.toString())!;

        return [
            connPoint.pos,
            Vector2D.sum(connPoint.pos, Vector2D.fromPolar(Attribute.measurePotentialLength(this.label) + 15, connPoint.outDirection))
        ];
    }


    getMiddleSegmentPoint(): Vector2D {
        const deltaVector = Vector2D.fromPolar(Attribute.SEGMENT_LENGTH, this.segmentDirection);
        const endPoint = Vector2D.sum(this.centerPoint, deltaVector);

        return this.centerPoint.halfWayTo(endPoint);
    }

}