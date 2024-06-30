import { Drawable } from "../Drawable";

export class Node implements Drawable {

    label : string;
    x : number;
    y : number;

    static DRAWING_RADIUS : number = 40;

    constructor(label: string, x: number, y: number) {
        this.label = label;
        this.x = x;
        this.y = y;
    }


    draw(ctx: CanvasRenderingContext2D): void {
        //Draw Circle
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(this.x, this.y, Node.DRAWING_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        //Draw Label
        ctx.fillStyle = "black";
        ctx.font = Node.DRAWING_RADIUS + "px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.label, this.x, this.y);
    }


}