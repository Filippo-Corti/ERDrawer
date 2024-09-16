import Vector2D from "../utils/Vector2D";
import Shape from "./Shape";

export default class Entity extends Shape {

    static HALF_DIM_X: number = 50;
    static HALF_DIM_Y: number = 30;

    deltaX: number = Entity.HALF_DIM_X;
    deltaY: number = Entity.HALF_DIM_Y;

    getCorners(): Vector2D[] {
        return [
            new Vector2D(this.centerPoint.x - Entity.HALF_DIM_X, this.centerPoint.y - Entity.HALF_DIM_Y), //Top Left
            new Vector2D(this.centerPoint.x + Entity.HALF_DIM_X, this.centerPoint.y - Entity.HALF_DIM_Y), //Top Right
            new Vector2D(this.centerPoint.x + Entity.HALF_DIM_X, this.centerPoint.y + Entity.HALF_DIM_Y), //Bottom Right
            new Vector2D(this.centerPoint.x - Entity.HALF_DIM_X, this.centerPoint.y + Entity.HALF_DIM_Y), //Bottom Left
        ];
    }

    draw(ctx: CanvasRenderingContext2D): void {
        //Draw Rectangle
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.centerPoint.x - Entity.HALF_DIM_X, this.centerPoint.y - Entity.HALF_DIM_Y);
        ctx.lineTo(this.centerPoint.x + Entity.HALF_DIM_X, this.centerPoint.y - Entity.HALF_DIM_Y);
        ctx.lineTo(this.centerPoint.x + Entity.HALF_DIM_X, this.centerPoint.y + Entity.HALF_DIM_Y);
        ctx.lineTo(this.centerPoint.x - Entity.HALF_DIM_X, this.centerPoint.y + Entity.HALF_DIM_Y);
        ctx.lineTo(this.centerPoint.x - Entity.HALF_DIM_X, this.centerPoint.y - Entity.HALF_DIM_Y);
        ctx.fill();
        ctx.stroke();

        //Draw Label
        ctx.fillStyle = "black";
        ctx.font = this.labelFontSize + "px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.label, this.centerPoint.x, this.centerPoint.y);

    }

    generateConnectionPoints(): void {
        const corners = this.getCorners();
        const connPoints : Vector2D[] = [];

        // Top Points (Left to Right)
        for (let x = corners[0].x + this.deltaX; x < corners[1].x; x += this.deltaX) {
            connPoints.push(new Vector2D(x, corners[0].y));
        }

        // Right Points (Top to Bottom)
        for (let y = corners[1].y + this.deltaY; y < corners[2].y; y += this.deltaY) {
            connPoints.push(new Vector2D(corners[1].x, y));
        }

        // Bottom Points (Right to Left) 
        for (let x = corners[2].x - this.deltaX; x > corners[3].x; x -= this.deltaX) {
            connPoints.push(new Vector2D(x, corners[2].y));
        }

        // Left Points (Bottom to Top)
        for (let y = corners[3].y - this.deltaY; y > corners[0].y; y -= this.deltaY) {
            connPoints.push(new Vector2D(corners[3].x, y));
        }

        for(const p of connPoints) {
            const cp = {pos : p, value : null};
            this.connectionPoints.push(cp);
        }
    }

    calculateLabelSize(): number {
        const BORDER: number = 15;
        const ctx = document.createElement("canvas").getContext("2d")!; // Fictionary context to measure label length
        let fontSize = Entity.HALF_DIM_X;

        do {
            ctx.font = fontSize + "px serif";
            fontSize -= 3;
        } while (ctx.measureText(this.label).width > (Entity.HALF_DIM_X - BORDER) * 2);

        return fontSize;
    }


}