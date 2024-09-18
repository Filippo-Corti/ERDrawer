import Vector2D from "../utils/Vector2D";
import { ConnectionPoint } from "./ConnectionPoint";
import Entity from "./Entity";
import Shape from "./Shape";

export default class Relationship extends Shape {

    static HALF_DIAG_X: number = 70;
    static HALF_DIAG_Y: number = 50;

    entities: Entity[];

    constructor(centerPoint: Vector2D, label: string) {
        super(centerPoint, label, Relationship.HALF_DIAG_X, Relationship.HALF_DIAG_Y);
        this.entities = [];
    }

    linkToEntity(e: Entity): void {
        this.occupyConnectionPoint(this.findConnectionPointFor(e).pos, e);
        this.entities.push(e);
    }

    isTheNearestConnectionPoint(p: Vector2D, connPoint: Vector2D): boolean {
        const currDist = connPoint.distanceTo(p);
        return (currDist <= Math.hypot(this.deltaX, this.deltaY) / 2);
    }

    getCorners(): Vector2D[] {
        return [
            new Vector2D(this.centerPoint.x, this.centerPoint.y - Relationship.HALF_DIAG_Y),
            new Vector2D(this.centerPoint.x + Relationship.HALF_DIAG_X, this.centerPoint.y),
            new Vector2D(this.centerPoint.x, this.centerPoint.y + Relationship.HALF_DIAG_Y),
            new Vector2D(this.centerPoint.x - Relationship.HALF_DIAG_X, this.centerPoint.y),
        ];
    }

    draw(ctx: CanvasRenderingContext2D): void {
        // Draw Rhombus in the MiddlePoint
        const rhombusVertices = this.getCorners();
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(rhombusVertices[rhombusVertices.length - 1].x, rhombusVertices[rhombusVertices.length - 1].y);
        for (const v of rhombusVertices) {
            ctx.lineTo(v.x, v.y);
        }
        ctx.fill();
        ctx.stroke();

        //Draw Label
        ctx.fillStyle = "black";
        ctx.font = this.labelFontSize + "px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.label, this.centerPoint.x, this.centerPoint.y);

        // Draw Paths to Entities 
        for (const e of this.entities) {
            const path = this.getPathTo(e);
            ctx.beginPath();
            for (const v of path) {
                ctx.lineTo(v.x, v.y);
            }
            ctx.stroke();
        }
    }

    generateConnectionPoints(): void {
        this.connectionPoints = new Map<string, ConnectionPoint>();
        const corners = this.getCorners();

        // Top to Right Points
        const corner1 = { pos: new Vector2D(corners[0].x, corners[0].y), value: null, outDirection: - Math.PI / 2 };
        this.connectionPoints.set(corner1.pos.toString(), corner1);
        for (let x = corners[0].x + this.deltaX, y = corners[0].y + this.deltaY; x < corners[1].x && y < corners[1].y; x += this.deltaX, y += this.deltaY) {
            const cp = { pos: new Vector2D(x, y), value: null, outDirection: - 3 / 4 * Math.PI };
            this.connectionPoints.set(cp.pos.toString(), cp);
        }

        // Right To Bottom Points
        const corner2 = { pos: new Vector2D(corners[1].x, corners[1].y), value: null, outDirection: 0 };
        this.connectionPoints.set(corner2.pos.toString(), corner2);
        for (let x = corners[1].x - this.deltaX, y = corners[1].y + this.deltaY; x > corners[2].x && y < corners[2].y; x -= this.deltaX, y += this.deltaY) {
            const cp = { pos: new Vector2D(x, y), value: null, outDirection: 3 / 4 * Math.PI };
            this.connectionPoints.set(cp.pos.toString(), cp);
        }

        // Bottom to Left Points
        const corner3 = { pos: new Vector2D(corners[2].x, corners[2].y), value: null, outDirection: Math.PI / 2 };
        this.connectionPoints.set(corner3.pos.toString(), corner3);
        for (let x = corners[2].x - this.deltaX, y = corners[2].y - this.deltaY; x > corners[3].x && y > corners[3].y; x -= this.deltaX, y -= this.deltaY) {
            const cp = { pos: new Vector2D(x, y), value: null, outDirection: 1 / 4 * Math.PI };
            this.connectionPoints.set(cp.pos.toString(), cp);
        }

        // Left to Top Points
        const corner4 = { pos: new Vector2D(corners[3].x, corners[3].y), value: null, outDirection: Math.PI };
        this.connectionPoints.set(corner4.pos.toString(), corner4);
        for (let x = corners[3].x + this.deltaX, y = corners[3].y - this.deltaY; x < corners[0].x && y > corners[0].y; x += this.deltaX, y -= this.deltaY) {
            const cp = { pos: new Vector2D(x, y), value: null, outDirection: - 1 / 4 * Math.PI };
            this.connectionPoints.set(cp.pos.toString(), cp);
        }
    }

    calculateLabelSize(): number {
        const BORDER: number = 15;
        const ctx = document.createElement("canvas").getContext("2d")!; // Fictionary context to measure label length
        let fontSize = Entity.HALF_DIM_X;

        do {
            ctx.font = fontSize + "px serif";
            fontSize -= 3;
        } while (ctx.measureText(this.label).width > Relationship.HALF_DIAG_X * 1.25 - BORDER);

        return fontSize;
    }

    getPathTo(e: Entity): Vector2D[] {
        const STRAIGHT_SEGMENT_LENGTH : number = 30;
        const myConnPoint = this.getCurrentConnectionPointFor(e);
        const myCorner = Vector2D.sum(myConnPoint.pos, Vector2D.fromPolar(STRAIGHT_SEGMENT_LENGTH, myConnPoint.outDirection));
        const theirConnPoint = e.getCurrentConnectionPointFor(this);
        const theirCorner = Vector2D.sum(theirConnPoint.pos, Vector2D.fromPolar(STRAIGHT_SEGMENT_LENGTH, theirConnPoint.outDirection));
        return [
            myConnPoint.pos,
            myCorner,
            theirCorner,
            theirConnPoint.pos
        ];
    }

}