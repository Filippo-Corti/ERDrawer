import Vector2D from "../utils/Vector2D";
import { ConnectionPoint } from "./ConnectionPoint";
import Relationship from "./Relationship";
import Shape from "./Shape";

export default class Entity extends Shape {

    static HALF_DIM_X: number = 50;
    static HALF_DIM_Y: number = 30;

    relationships: Relationship[];

    constructor(centerPoint: Vector2D, label: string) {
        super(centerPoint, label, Entity.HALF_DIM_X, Entity.HALF_DIM_Y);
        this.relationships = [];
    }

    linkRelationship(r: Relationship): void {
        this.occupyConnectionPoint(this.findConnectionPointFor(r), r);
        this.relationships.push(r);
    }

    isTheNearestConnectionPoint(p: Vector2D, connPoint: Vector2D): boolean {
        const currDist = connPoint.distanceTo(p);
        return (currDist <= Math.hypot(this.deltaX, this.deltaY) / 2);
    }

    getCorners(): Vector2D[] {
        return [
            new Vector2D(this.centerPoint.x - Entity.HALF_DIM_X, this.centerPoint.y - Entity.HALF_DIM_Y), //Top Left
            new Vector2D(this.centerPoint.x + Entity.HALF_DIM_X, this.centerPoint.y - Entity.HALF_DIM_Y), //Top Right
            new Vector2D(this.centerPoint.x + Entity.HALF_DIM_X, this.centerPoint.y + Entity.HALF_DIM_Y), //Bottom Right
            new Vector2D(this.centerPoint.x - Entity.HALF_DIM_X, this.centerPoint.y + Entity.HALF_DIM_Y), //Bottom Left
        ];
    }

    draw(ctx: CanvasRenderingContext2D): void {
        //Draw Rectangle
        const rectangleVertices = this.getCorners();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(rectangleVertices[rectangleVertices.length - 1].x, rectangleVertices[rectangleVertices.length - 1].y);
        for (const v of rectangleVertices) {
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

    }

    generateConnectionPoints(): void {
        this.connectionPoints = new Map<string, ConnectionPoint>();
        const corners = this.getCorners();
        const connPoints: Vector2D[] = [];

        // Top Points (Left to Right)
        for (let x = corners[0].x + this.deltaX; x < corners[1].x; x += this.deltaX) {
            connPoints.push(new Vector2D(x, corners[0].y));
        }

        // Right Points (Top to Bottom)
        for (let y = corners[1].y + this.deltaY; y < corners[2].y; y += this.deltaY) {
            connPoints.push(new Vector2D(corners[1].x, y));
        }

        // Bottom Points (Right to Left) 
        for (let x = corners[2].x - this.deltaX; x > corners[3].x; x -= this.deltaX) {
            connPoints.push(new Vector2D(x, corners[2].y));
        }

        // Left Points (Bottom to Top)
        for (let y = corners[3].y - this.deltaY; y > corners[0].y; y -= this.deltaY) {
            connPoints.push(new Vector2D(corners[3].x, y));
        }

        for (const p of connPoints) {
            const cp = { pos: p, value: null };
            this.connectionPoints.set(p.toString(), cp);
        }
    }

    calculateLabelSize(): number {
        const BORDER: number = 15;
        const ctx = document.createElement("canvas").getContext("2d")!; // Fictionary context to measure label length
        let fontSize = Entity.HALF_DIM_X;

        do {
            ctx.font = fontSize + "px serif";
            fontSize -= 3;
        } while (ctx.measureText(this.label).width > (Entity.HALF_DIM_X - BORDER) * 2);

        return fontSize;
    }


}