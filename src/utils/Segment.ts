import { Vector2D } from "./Vector2D";

export class Segment {

    a: Vector2D;
    b: Vector2D;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.a = new Vector2D(x1, y1);
        this.b = new Vector2D(x2, y2);
    }

    // From https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
    intersects(s: Segment): boolean {

        // Find the four orientations needed for general and 
        // special cases 
        let o1 = this.orientation(this.a, this.b, s.a);
        let o2 = this.orientation(this.a, this.b, s.b);
        let o3 = this.orientation(s.a, s.b, this.a);
        let o4 = this.orientation(s.a, s.b, this.b);

        // General case 
        if (o1 != o2 && o3 != o4) {
            return true;
        }
        // Special Cases 
        // this.a, this.b and s.a are collinear and s.a lies on segment this.a-this.b 
        if (o1 == 0 && this.onSegment(this.a, s.a, this.b)) return true;

        // this.a, this.b and s.b are collinear and s.b lies on segment this.a-this.b 
        if (o2 == 0 && this.onSegment(this.a, s.b, this.b)) return true;

        // s.a, s.b and this.a are collinear and this.a lies on segment s.a-s.b 
        if (o3 == 0 && this.onSegment(s.a, this.a, s.b)) return true;

        // s.a, s.b and this.b are collinear and this.b lies on segment s.a-s.b 
        if (o4 == 0 && this.onSegment(s.a, this.b, s.b)) return true;

        return false; // Doesn't fall in any of the above cases 
    }

    // To find orientation of ordered triplet (p, q, r). 
    // The function returns following values 
    // 0 --> p, q and r are collinear 
    // 1 --> Clockwise 
    // 2 --> Counterclockwise 
    orientation(p: Vector2D, q: Vector2D, r: Vector2D): number {

        let val = (q.y - p.y) * (r.x - q.x) -
            (q.x - p.x) * (r.y - q.y);

        if (val == 0) return 0; // collinear 

        return (val > 0) ? 1 : 2; // clock or counterclock wise 
    }

    // Given three collinear points p, q, r, the function checks if 
    // point q lies on line segment 'pr' 
    onSegment(p: Vector2D, q: Vector2D, r: Vector2D) {
        if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y))
            return true;

        return false;
    }

    parallel(s: Segment): boolean {
        const vector1 = new Vector2D(this.b.x - this.a.x, this.b.y - this.a.y);
        const vector2 = new Vector2D(s.b.x - s.a.x, s.b.y - s.a.y);
    
        const crossProduct = vector1.x * vector2.y - vector1.y * vector2.x;

        return Math.abs(crossProduct) < 10e-2;
    }

}