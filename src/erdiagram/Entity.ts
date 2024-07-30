import { Node } from "../graph/Node";
import { Vector2D } from "../utils/Vector2D";

export class Entity extends Node {

    draw(ctx: CanvasRenderingContext2D): void {
        const PADDING = 15;
        const dimX = this.size, dimY = this.size * 3/5;

        //Draw Rectangle
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.pos.x - dimX, this.pos.y - dimY);
        ctx.lineTo(this.pos.x + dimX, this.pos.y - dimY);
        ctx.lineTo(this.pos.x + dimX, this.pos.y + dimY);
        ctx.lineTo(this.pos.x - dimX, this.pos.y + dimY);
        ctx.lineTo(this.pos.x - dimX, this.pos.y - dimY);
        ctx.fill();
        ctx.stroke();

        //Draw Label
        ctx.fillStyle = "black";
        let fontSize = this.size;
        do {
            ctx.font = fontSize + "px serif";
            fontSize-=3;
        } while (ctx.measureText(this.label).width > (dimX - PADDING) * 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.label, this.pos.x, this.pos.y);
    }

    clone() : Entity {
        const newNode = new Entity(this.label, this.pos.x, this.pos.y, this.size);
        newNode.disp = new Vector2D(this.disp.x, this.disp.y);
        return newNode;
    }
}