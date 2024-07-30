import { Drawable } from "../utils/Drawable";
import { Segment } from "../utils/Segment";
import { Vector2D } from "../utils/Vector2D";

export class Node implements Drawable {

    label : string;
    pos : Vector2D;
    disp : Vector2D;
    size : number;

    constructor(label: string, x: number, y: number, size : number = 30) {
        this.label = label;
        this.pos = new Vector2D(x, y);
        this.disp = new Vector2D(0, 0);
        this.size = size;
    }


    draw(ctx: CanvasRenderingContext2D): void {
        const PADDING = (this.label.length < 5) ? 15 : 4;
        //Draw Circle
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        //Draw Label
        ctx.fillStyle = "black";
        let fontSize = this.size;
        do {
            ctx.font = fontSize + "px serif";
            fontSize-=3;
        } while (ctx.measureText(this.label).width > (this.size - PADDING) * 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.label, this.pos.x, this.pos.y);
    }

    // For normal Nodes, the connection point is only the central one 
    occupyClosestConnectionPoint(_point : Vector2D) : Vector2D {
        return this.pos;
    }

    // For normal Nodes, the connection point is only the central one 
    occupyConnectionPointBySegment(_segment : Segment) : Vector2D | null {
        return this.pos;
    }

    clone() : Node {
        const newNode = new Node(this.label, this.pos.x, this.pos.y, this.size);
        newNode.disp = new Vector2D(this.disp.x, this.disp.y);
        return newNode;
    }

}