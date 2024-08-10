import { Drawable } from "../utils/Drawable";
import { Vector2D } from "../utils/Vector2D";

export class Attribute implements Drawable {

    label: string
    startingPoint: Vector2D;
    length: number = 30;
    direction: number = - Math.PI / 2; //Angle in radiants
    filledPoint: boolean;

    static fontSize : number = 15;

    constructor(label: string, startingPoint: Vector2D, filledPoint: boolean = false) {
        this.label = label;
        this.startingPoint = startingPoint;
        this.filledPoint = filledPoint;
    }

    totalLength() : number {
        const ctx = document.createElement("canvas").getContext("2d")!; // Fictionary context to measure label length
        ctx.font = Attribute.fontSize + "px serif";
        return this.length + ctx.measureText(this.label).width;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const SIZE = 5;
        const deltaVector = Vector2D.fromPolar(this.length, this.direction);
        const endPoint = Vector2D.sum(this.startingPoint, deltaVector);

        // Draw Line
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.startingPoint.x, this.startingPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();


        // Draw Point
        ctx.fillStyle = (this.filledPoint) ? "black" : "white";
        ctx.beginPath();
        ctx.arc(endPoint.x, endPoint.y, SIZE, 0, 2 * Math.PI, true);
        ctx.fill();
        ctx.stroke();

        // Draw Text
        ctx.save();
        ctx.fillStyle = "black";
        ctx.textBaseline = "middle";
        ctx.font = Attribute.fontSize + "px serif";
        ctx.translate(endPoint.x, endPoint.y);
        if (this.direction > Math.PI / 2 && this.direction < 3 / 2 * Math.PI) {
            ctx.rotate(this.direction + Math.PI);
            ctx.textAlign = "end";
            ctx.fillText(this.label, - (SIZE + 3), 0);
        } else {
            ctx.rotate(this.direction);
            ctx.textAlign = "start";
            ctx.fillText(this.label, SIZE + 3, 0);
        }
        ctx.restore();
    }

    clone(): Attribute {
        const newAttr = new Attribute(this.label, this.startingPoint, this.filledPoint);
        newAttr.length = this.length;
        newAttr.direction = this.direction;
        return newAttr;
    }



}