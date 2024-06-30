export class Vector2D {

    x : number;
    y : number;

    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    }
    
    magnitude() : number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    sum(v : Vector2D) {
        this.x += v.x;
        this.y += v.y;
    }

    negative() : Vector2D {
        return new Vector2D(-this.x, -this.y);
    }

};