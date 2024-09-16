import Shape from "./Shape";

export default class Entity extends Shape {

    static HALF_DIM_X: number = 50;
    static HALF_DIM_Y: number = 30;

    deltaX: number = Entity.HALF_DIM_X;
    deltaY: number = Entity.HALF_DIM_Y;

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
    }

    generateConnectionPoints(): void {
        throw new Error("Method not implemented.");
    }

}