import { Drawable } from "../Drawable";
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
            const theta = Math.atan2(this.node2.pos.y - this.node1.pos.y, this.node2.pos.x - this.node1.pos.x);
            const offsetFactor = (i - (this.count - 1) / 2);
            const dx = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * Math.sin(theta);
            const dy = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * -Math.cos(theta);
            ctx.beginPath();
            ctx.moveTo(this.node1.pos.x + dx, this.node1.pos.y + dy);
            ctx.lineTo(this.node2.pos.x + dx, this.node2.pos.y + dy);
            ctx.stroke();
        }
    }


}