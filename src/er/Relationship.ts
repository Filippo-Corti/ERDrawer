import { Segment } from "../utils/Segment";
import Vector2D from "../utils/Vector2D";
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
        e.occupyConnectionPoint(this.findEntityConnectionPointToEntity(e), this);
        this.occupyConnectionPoint(this.findMyConnectionPointToEntity(e), e);
        this.entities.push(e);
        e.relationships.push(this);
    }

    findEntityConnectionPointToEntity(e: Entity): Vector2D {
        const segmentToEntity = Segment.fromVectors(this.centerPoint, e.centerPoint);
        const intersectionPoint: Vector2D = e.getPointByIntersectingSegment(segmentToEntity);

        do {
            const allConnPoints = e.getAllConnectionPoints();
            for (const cp of allConnPoints) {
                if (cp.value !== null) continue;
                const currDist = cp.pos.distanceTo(intersectionPoint);
                if (Math.abs(cp.pos.y - intersectionPoint.y) <= 10 && currDist <= e.deltaX / 2 || Math.abs(cp.pos.x - intersectionPoint.x) <= 10 && currDist <= e.deltaY / 2) {
                    // ConnectionPoint found
                    return cp.pos;
                }
            }
        } while (e.reduceDeltasAndRegenerate());
        throw new Error("Couldn't find a connection point");
    }

    findMyConnectionPointToEntity(e: Entity): Vector2D {
        const segmentFromEntity = Segment.fromVectors(e.centerPoint, this.centerPoint);
        const intersectionPoint: Vector2D = this.getPointByIntersectingSegment(segmentFromEntity);

        do {
            const allConnPoints = this.getAllConnectionPoints();
            for (const cp of allConnPoints) {
                if (cp.value !== null) continue;
                const currDist = cp.pos.distanceTo(intersectionPoint);
                if (currDist <= Math.hypot(this.deltaX, this.deltaY) / 2 ) {
                    // ConnectionPoint found
                    return cp.pos;
                }
            }
        } while (this.reduceDeltasAndRegenerate());
        console.log(this, intersectionPoint)
        throw new Error("Couldn't find a connection point");

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
            ctx.moveTo(path[path.length - 1].x, path[path.length - 1].y);
            for (const v of path) {
                ctx.lineTo(v.x, v.y);
            }
            ctx.stroke();
        }
    }

    generateConnectionPoints(): void {
        const corners = this.getCorners();
        const connPoints: Vector2D[] = [];

        // Top to Right Points
        for (let x = corners[0].x, y = corners[0].y; x < corners[1].x && y < corners[1].y; x += this.deltaX, y += this.deltaY) {
            connPoints.push(new Vector2D(x, y));
        }

        // Right To Bottom Points
        for (let x = corners[1].x, y = corners[1].y; x > corners[2].x && y < corners[2].y; x -= this.deltaX, y += this.deltaY) {
            connPoints.push(new Vector2D(x, y));
        }

        // Bottom to Left Points
        for (let x = corners[2].x, y = corners[2].y; x > corners[3].x && y > corners[3].y; x -= this.deltaX, y -= this.deltaY) {
            connPoints.push(new Vector2D(x, y));
        }

        // Left to Top Points
        for (let x = corners[3].x, y = corners[3].y; x < corners[0].x && y > corners[0].y; x += this.deltaX, y -= this.deltaY) {
            connPoints.push(new Vector2D(x, y));
        }

        for (const p of connPoints) {
            const cp = { pos: p, value: null };
            this.connectionPoints.push(cp);
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
        const myConnPoint = this.getConnectionPointFor(e);
        const theirConnPoint = e.getConnectionPointFor(this);
        return [
            myConnPoint,
            theirConnPoint
        ];
    }

}