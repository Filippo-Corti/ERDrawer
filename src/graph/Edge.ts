import { Drawable } from "../Drawable";
import { Node } from "./Node";

export class Edge implements Drawable {

    node1 : Node;
    node2 : Node;

    static DRAWING_RADIUS : number = 50;

    constructor(node1 : &Node, node2 : &Node) {
        this.node1 = node1;
        this.node2 = node2;
    }


    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.moveTo(this.node1.pos.x, this.node1.pos.y);
        ctx.lineTo(this.node2.pos.x, this.node2.pos.y);
        ctx.stroke();
    }


}