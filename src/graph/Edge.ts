import { Drawable } from "../utils/Drawable";
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
        const OFFSET_BETWEEN_MULTIEDGES = 100; //In the center
        const pos1 = this.node1.occupyClosestConnectionPoint(this.node1.pos);
        const pos2 = this.node2.occupyClosestConnectionPoint(this.node2.pos);

        const mx = (pos2.x + pos1.x) / 2;
        const my = (pos2.y + pos1.y) / 2;
        for (let i = 0; i < this.count; i++) {
            // Calculate offset
            const theta = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
            const offsetFactor = (i - (this.count - 1) / 2);
            const dx = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * Math.sin(theta);
            const dy = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * -Math.cos(theta);

            // Draw Edge
            ctx.beginPath();
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(mx + dx, my + dy);
            ctx.lineTo(pos2.x, pos2.y);
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

    clone() : Edge {
        return new Edge(this.node1, this.node2, this.count);
    }


}