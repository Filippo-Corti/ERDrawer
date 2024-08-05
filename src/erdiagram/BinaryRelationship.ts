import { Edge } from "../graph/Edge";
import { Node } from "../graph/Node";
import { Vector2D } from "../utils/Vector2D";
import { Entity } from "./Entity";

export class BinaryRelationship extends Edge {

    labels: string[];

    constructor(node1: Node, node2: Node, count: number = 1, labels: string[], vertex1? : Vector2D, vertex2? : Vector2D) {
        super(node1, node2, count, vertex1, vertex2);
        this.labels = [];
        if (labels.length < count) {
            console.log(node1.label, node2.label, count, labels);
            throw new Error("Not enough labels");
        }
        for (let i = 0; i < count; i++) {
            this.labels.push(labels[i]);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const OFFSET_BETWEEN_MULTIEDGES = 150; //In the center
        const PADDING = 15;
        const corners = this.getCorners();

        if (!this.vertex1 || !this.vertex2) {
            throw new Error("Couldn't find a Connection Point!");
        }

        const mx = (this.vertex2.x + this.vertex1.x) / 2;
        const my = (this.vertex2.y + this.vertex1.y) / 2;
        for (let i = 0; i < this.count; i++) {
            // Calculate offset
            const theta = Math.atan2(this.vertex2.y - this.vertex1.y, this.vertex2.x - this.vertex1.x);
            const offsetFactor = (i - (this.count - 1) / 2);
            const dx = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * Math.sin(theta);
            const dy = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * -Math.cos(theta);

            // Draw Edge
            ctx.beginPath();
            ctx.moveTo(this.vertex1.x, this.vertex1.y);
            ctx.lineTo(corners[0].x, corners[0].y);
            ctx.lineTo(mx + dx, my + dy);
            ctx.lineTo(corners[1].x, corners[1].y);
            ctx.lineTo(this.vertex2.x, this.vertex2.y);
            ctx.stroke();

            // Draw Rhombus half way
            const halfDiagY = 50, halfDiagX = 70;
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.moveTo(mx + dx, my + dy - halfDiagY);
            ctx.lineTo(mx + dx + halfDiagX, my + dy);
            ctx.lineTo(mx + dx, my + dy + halfDiagY);
            ctx.lineTo(mx + dx - halfDiagX, my + dy);
            ctx.lineTo(mx + dx, my + dy - halfDiagY);
            ctx.fill();
            ctx.stroke();

            //Draw Label
            ctx.fillStyle = "black";
            let fontSize = halfDiagX * 1.25;
            do {
                ctx.font = fontSize + "px serif";
                fontSize -= 3;
            } while (ctx.measureText(this.labels[i]).width > (halfDiagX * 1.25 - PADDING));
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.labels[i], mx + dx, my + dy);

        }
    }

    // Return edge's corners
    getCorners() : Vector2D[] {
        const distToVertex = 100;
        const corners : Vector2D[] = [];
        let edgeDirection = (this.node1 as Entity).getRectangleSegmentByPoint(this.vertex1)!.getDirection() + Math.PI / 2;
        corners.push(Vector2D.sum(this.vertex1, Vector2D.fromPolar(distToVertex, edgeDirection)));
        edgeDirection = (this.node2 as Entity).getRectangleSegmentByPoint(this.vertex2)!.getDirection() + Math.PI / 2;
        corners.push(Vector2D.sum(this.vertex2, Vector2D.fromPolar(distToVertex, edgeDirection)));
        return corners;
    }
 

    clone() : BinaryRelationship {
        return new BinaryRelationship(this.node1, this.node2, this.count, this.labels, this.vertex1, this.vertex2);
    }


}