import { Drawable } from "../Drawable";
import { Segment } from "../utils/Segment";
import { Vector2D } from "../utils/Vector2D";
import { Node } from "./Node";

export class Edge implements Drawable {

    node1: Node;
    node2: Node;
    count: number;

    static DRAWING_RADIUS: number = 50;

    constructor(node1: Node, node2: Node, count: number = 1) {
        this.node1 = node1;
        this.node2 = node2;
        this.count = count;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const OFFSET_BETWEEN_MULTIEDGES = 15;
        for (let i = 0; i < this.count; i++) {
            // Calculate offset
            const theta = Math.atan2(this.node2.pos.y - this.node1.pos.y, this.node2.pos.x - this.node1.pos.x);
            const offsetFactor = (i - (this.count - 1) / 2);
            const dx = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * Math.sin(theta);
            const dy = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * -Math.cos(theta);

            // Draw Edge
            ctx.beginPath();
            ctx.moveTo(this.node1.pos.x + dx, this.node1.pos.y + dy);
            ctx.lineTo(this.node2.pos.x + dx, this.node2.pos.y + dy);
            ctx.stroke();

            // Draw Rhombus half way
            const mx = (this.node2.pos.x + this.node1.pos.x) / 2;
            const my = (this.node2.pos.y + this.node1.pos.y) / 2;
            const halfDiag1 = 30, halfDiag2 = 50;
            ctx.beginPath();
            ctx.moveTo(mx, my - halfDiag1);
            ctx.lineTo(mx + halfDiag2, my);
            ctx.lineTo(mx, my + halfDiag1);
            ctx.lineTo(mx - halfDiag2, my);
            ctx.lineTo(mx, my - halfDiag1);
            ctx.stroke();

        }
    }

    //Returns the Segment corresponding to this Edge. It doesn't take the exact center of the node,
    // but a point next to it that sits on the edge.
    //If number > 1, only the "main" segment is returned.
    getDrawingSegment(): Segment {

        const thetaA = new Vector2D(this.node2.pos.x - this.node1.pos.x, this.node2.pos.y - this.node1.pos.y).phase();
        const thetaB = new Vector2D(this.node1.pos.x - this.node2.pos.x, this.node1.pos.y - this.node2.pos.y).phase();

        const OFFSET = 1;

        return new Segment(this.node1.pos.x + OFFSET * Math.cos(thetaA), this.node1.pos.y + OFFSET * Math.sin(thetaA), this.node2.pos.x + OFFSET * Math.cos(thetaB), this.node2.pos.y + OFFSET * Math.sin(thetaB));
    }


}