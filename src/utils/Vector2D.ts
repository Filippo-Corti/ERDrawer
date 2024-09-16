export default class Vector2D {

    x : number;
    y : number;

    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    }
    
    static fromPolar(magnitude: number, phase: number): Vector2D {
        const x = magnitude * Math.cos(phase);
        const y = magnitude * Math.sin(phase);
        return new Vector2D(x, y);
    }

    static sum(v1 : Vector2D, v2 : Vector2D) : Vector2D {
        return new Vector2D(v1.x + v2.x, v1.y + v2.y);
    }
    
    magnitude() : number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    phase() : number {
        return Math.atan2(this.y, this.x);
    }

    sum(v : Vector2D) {
        this.x += v.x;
        this.y += v.y;
    }

    negative() : Vector2D {
        return new Vector2D(-this.x, -this.y);
    }

    distanceTo(v : Vector2D) : number {
        return Math.hypot(v.x - this.x, v.y - this.y);
    }

    toString() : string {
        return this.x + ";" + this.y;
    }

};