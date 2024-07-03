export class Drawer {

    canvas : HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  
   constructor(canvasId : string) {
        const canvas = document.getElementById(canvasId);
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Invalid ID for the Canvas");
        }
        this.canvas =  canvas as HTMLCanvasElement;

        const ctx = this.canvas.getContext("2d");
         if (!(ctx instanceof CanvasRenderingContext2D)) {
            throw new Error("Could not get 2D Context for the Canvas");
        }
        this.ctx = ctx as CanvasRenderingContext2D;
    }

    clear() : void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() : void {
        const SIZE = 250;
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.ctx.strokeStyle = "red";
        for (let i = 0; i <= width/SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i*SIZE - SIZE/2, 0);
            this.ctx.lineTo(i*SIZE - SIZE/2, height);        
            this.ctx.stroke();
        }
        for (let i = 0; i <= height/SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i*SIZE - SIZE/2);
            this.ctx.lineTo(width, i*SIZE - SIZE/2);        
            this.ctx.stroke();
        }
        this.ctx.strokeStyle = "black";
    }

    /*drawCircle(x : number, y : number, radius : number, color : string = 'rgba(0 0 0 / 1)') : void {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }*/

}