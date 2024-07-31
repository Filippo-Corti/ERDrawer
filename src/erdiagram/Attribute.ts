import { Drawable } from "../utils/Drawable";
import { Vector2D } from "../utils/Vector2D";

export class Attribute implements Drawable {

    label: string
    startingPoint: Vector2D;
    length: number = 30;
    direction: number = - Math.PI / 2; //Angle in radiants

    constructor(label: string, startingPoint : Vector2D) {
        this.label = label;
        this.startingPoint = startingPoint;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const SIZE = 7;
        const deltaVector = Vector2D.fromPolar(this.length, this.direction);
        const endPoint = Vector2D.sum(this.startingPoint, deltaVector);

        // Draw Line
        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.moveTo(this.startingPoint.x, this.startingPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();

        console.log( deltaVector);
        
        // Draw Point
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(endPoint.x, endPoint.y, SIZE, 0, 2 * Math.PI, true);
        ctx.fill();
    }

    clone() : Attribute {
        const newAttr = new Attribute(this.label, this.startingPoint);
        newAttr.length = this.length;
        newAttr.direction = this.direction;
        return newAttr;
    }



}