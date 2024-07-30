export class Drawer {

    canvas : HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
  
   constructor(canvasId : string) {
        const canvas = document.getElementById(canvasId);
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Invalid ID for the Canvas");
        }
        this.canvas =  canvas as HTMLCanvasElement;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        const ctx = this.canvas.getContext("2d");
         if (!(ctx instanceof CanvasRenderingContext2D)) {
            throw new Error("Could not get 2D Context for the Canvas");
        }
        this.ctx = ctx as CanvasRenderingContext2D;
    }

    clear() : void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid(SIZE : number) : void {
        this.ctx.strokeStyle = "red";
        for (let i = 0; i <= this.width/SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i*SIZE - SIZE/2, 0);
            this.ctx.lineTo(i*SIZE - SIZE/2, this.height);        
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.height/SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i*SIZE - SIZE/2);
            this.ctx.lineTo(this.width, i*SIZE - SIZE/2);        
            this.ctx.stroke();
        }
        this.ctx.strokeStyle = "black";
    }

    drawPoint(x: number, y: number, size: number = 5, color: string = 'red'): void {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, 2 * Math.PI, true);
        this.ctx.fill();
    }

}