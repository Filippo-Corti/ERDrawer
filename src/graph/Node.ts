import { Drawable } from "../Drawable";
import { Vector2D } from "../Vector2D";

export class Node implements Drawable {

    label : string;
    pos : Vector2D;
    disp : Vector2D;
    size : number = 30;

    constructor(label: string, x: number, y: number) {
        this.label = label;
        this.pos = new Vector2D(x, y);
        this.disp = new Vector2D(0, 0);
    }


    draw(ctx: CanvasRenderingContext2D): void {
        //Draw Circle
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        //Draw Label
        ctx.fillStyle = "black";
        ctx.font = this.size + "px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.label, this.pos.x, this.pos.y);
    }


}