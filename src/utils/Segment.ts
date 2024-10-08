import Vector2D from "./Vector2D";

export class Segment {

    a: Vector2D;
    b: Vector2D;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this.a = new Vector2D(x1, y1);
        this.b = new Vector2D(x2, y2);
    }

    static fromVectors(a: Vector2D, b: Vector2D): Segment {
        return new Segment(a.x, a.y, b.x, b.y);
    }

    // Returns whether this and s intersect.
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
        if (o1 == 0 && Segment.onSegment(this.a, s.a, this.b)) return true;

        // this.a, this.b and s.b are collinear and s.b lies on segment this.a-this.b 
        if (o2 == 0 && Segment.onSegment(this.a, s.b, this.b)) return true;

        // s.a, s.b and this.a are collinear and this.a lies on segment s.a-s.b 
        if (o3 == 0 && Segment.onSegment(s.a, this.a, s.b)) return true;

        // s.a, s.b and this.b are collinear and this.b lies on segment s.a-s.b 
        if (o4 == 0 && Segment.onSegment(s.a, this.b, s.b)) return true;

        return false; // Doesn't fall in any of the above cases 
    }

    intersectsAny(segments: Segment[]): boolean {
        return segments.find((s) => this.intersects(s)) != null;
    }

    // Returns the intersection point between the segments this and s.
    getIntersection(s: Segment): Vector2D | null {
        if (!this.intersects(s)) return null;

        // Segment this represented as a1x + b1y = c1
        let a1 = this.b.y - this.a.y;
        let b1 = this.a.x - this.b.x;
        let c1 = a1 * this.a.x + b1 * this.a.y;

        // Segment s represented as a2x + b2y = c2
        let a2 = s.b.y - s.a.y;
        let b2 = s.a.x - s.b.x;
        let c2 = a2 * s.a.x + b2 * s.a.y;

        // Solve as Matrix using Cramer's Rule
        let determinant = a1 * b2 - a2 * b1;
        if (determinant == 0) return null;
        let x = (b2 * c1 - b1 * c2) / determinant;
        let y = (a1 * c2 - a2 * c1) / determinant;

        return new Vector2D(x, y);
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
    static onSegment(p: Vector2D, q: Vector2D, r: Vector2D, tolerance: number = 1e-5): boolean {
        if (q.x <= Math.max(p.x, r.x) + tolerance && q.x >= Math.min(p.x, r.x) - tolerance &&
            q.y <= Math.max(p.y, r.y) + tolerance && q.y >= Math.min(p.y, r.y) - tolerance) {
            return true;
        }
        return false;
    }

    // Returns whether p is on this
    contains(p: Vector2D) {
        return Segment.onSegment(this.a, p, this.b);
    }

    // Returns whether this and s are parallel or not
    parallel(s: Segment): boolean {
        const vector1 = new Vector2D(this.b.x - this.a.x, this.b.y - this.a.y);
        const vector2 = new Vector2D(s.b.x - s.a.x, s.b.y - s.a.y);

        const crossProduct = vector1.x * vector2.y - vector1.y * vector2.x;

        return Math.abs(crossProduct) < 10e-2;
    }

    // Returns how far point is from the segment. 
    // From https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    distanceToPoint(point: Vector2D): number {
        var A = point.x - this.a.x;
        var B = point.y - this.a.y;
        var C = this.b.x - this.a.x;
        var D = this.b.y - this.a.y;

        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = -1;
        if (len_sq != 0) //in case of 0 length line
            param = dot / len_sq;

        var xx, yy;

        if (param < 0) {
            xx = this.a.x;
            yy = this.a.y;
        }
        else if (param > 1) {
            xx = this.b.x;
            yy = this.b.y;
        }
        else {
            xx = this.a.x + param * C;
            yy = this.a.y + param * D;
        }

        var dx = point.x - xx;
        var dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Orientation in Gradients
    getDirection(): number {
        return new Vector2D(this.a.x - this.b.x, this.a.y - this.b.y).phase();
    }

    equals(o: Segment): boolean {
        return (o.a.equals(this.a) && o.b.equals(this.b) || o.a.equals(this.b) && o.b.equals(this.a));
    }

}