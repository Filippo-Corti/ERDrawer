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


    /*drawCircle(x : number, y : number, radius : number, color : string = 'rgba(0 0 0 / 1)') : void {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }*/

}