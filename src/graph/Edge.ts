import { Drawable } from "../utils/Drawable";
import { Segment } from "../utils/Segment";
import { Vector2D } from "../utils/Vector2D";
import { Node } from "./Node";

export class Edge implements Drawable {

    node1: Node;
    node2: Node;
    //Vertex 1 and 2 are the extreme points of the edge
    vertex1: Vector2D;
    vertex2: Vector2D;
    //Middle Point is the point the edge passes through
    middlePoint: Vector2D

    static DRAWING_RADIUS: number = 50;
    static OFFSET_BETWEEN_MULTIEDGES: number = 30;

    constructor(node1: Node, node2: Node, vertex1?: Vector2D, vertex2?: Vector2D, middlePoint?: Vector2D) {
        this.node1 = node1;
        this.node2 = node2;

        //Vertex are initialized based on the segment that connects central positions of node1 and node2

        let v1: Vector2D | null = null, v2: Vector2D | null = null;
        if (!vertex1) {
            v1 = this.node1.occupyConnectionPointBySegment(Segment.fromVectors(node1.pos, node2.pos));
            if (!v1) {
                console.log(this);
                throw new Error("Error finding a connection point for the edge");
            }
        }

        if (!vertex2) {
            v2 = this.node2.occupyConnectionPointBySegment(Segment.fromVectors(node1.pos, node2.pos));
            if (!v2) {
                console.log(this);
                throw new Error("Error finding a connection point for the edge");
            }
        }

        this.vertex1 = vertex1 ? vertex1 : v1!;
        this.vertex2 = vertex2 ? vertex2 : v2!;

        if (!middlePoint) {
            middlePoint = new Vector2D((this.vertex1.x + this.vertex2.x) / 2, (this.vertex1.y + this.vertex2.y) / 2);
        }
        this.middlePoint = middlePoint;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        //Calculate Quadratic Curve control point
        const controlPoint: Vector2D = this.getControlPoint();

        // Draw Edge
        ctx.beginPath();
        ctx.moveTo(this.vertex1.x, this.vertex1.y);
        ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, this.vertex2.x, this.vertex2.y);
        ctx.stroke();
    }

    //Vertex are calculated based on the segment that connects central positions of node1 and node2
    calculateNewVertices(): void {
        const v1 = this.node1.occupyConnectionPointBySegment(Segment.fromVectors(this.node1.pos, this.node2.pos))!;
        const v2 = this.node2.occupyConnectionPointBySegment(Segment.fromVectors(this.node1.pos, this.node2.pos))!;

        if (!v1 || !v2) {
            throw new Error("Error finding a connection point for the edge");
        }

        this.vertex1 = v1;
        this.vertex2 = v2;
    }

    //Returns the Segment corresponding to this Edge. It doesn't take the exact center of the node,
    // but a point next to it that sits on the edge.
    getDrawingSegment(): Segment {
        const thetaA = new Vector2D(this.node2.pos.x - this.node1.pos.x, this.node2.pos.y - this.node1.pos.y).phase();
        const thetaB = new Vector2D(this.node1.pos.x - this.node2.pos.x, this.node1.pos.y - this.node2.pos.y).phase();

        const OFFSET = 1;

        if (!this.vertex1 || !this.vertex2) {
            this.calculateNewVertices();
        }

        return Segment.fromVectors(this.vertex1, this.vertex2);
        return new Segment(this.vertex1.x + OFFSET * Math.cos(thetaA), this.vertex1.y + OFFSET * Math.sin(thetaA), this.vertex2.x + OFFSET * Math.cos(thetaB), this.vertex2.y + OFFSET * Math.sin(thetaB));
    }

    getControlPoint(): Vector2D {
        return new Vector2D(
            2 * this.middlePoint.x - 0.5 * this.vertex1.x - 0.5 * this.vertex2.x,
            2 * this.middlePoint.y - 0.5 * this.vertex1.y - 0.5 * this.vertex2.y
        );
    }

    samplePoints(numSamples: number): Vector2D[] {
        const controlPoint = this.getControlPoint();
        const points: Vector2D[] = [];
        for (let t = 0; t <= 1; t += 1 / numSamples) {
            const x = Math.pow(1 - t, 2) * this.vertex1.x + 2 * (1 - t) * t * controlPoint.x + Math.pow(t, 2) * this.vertex2.x;
            const y = Math.pow(1 - t, 2) * this.vertex1.y + 2 * (1 - t) * t * controlPoint.y + Math.pow(t, 2) * this.vertex2.y;
            points.push(new Vector2D(x, y));
        }
        return points;
    }

    intersects(e: Edge) {
        const numSamples = 100;  // Increase for more accuracy
        const points1 = this.samplePoints(numSamples);
        const points2 = e.samplePoints(numSamples);

        for (let i = 0; i < points1.length - 1; i++) {
            const s1 = Segment.fromVectors(points1[i], points1[i + 1]);
            for (let j = 0; j < points2.length - 1; j++) {
                const s2 = Segment.fromVectors(points2[j], points2[j + 1]);
                if (s1.intersects(s2)) {
                    return true;
                }
            }
        }
        return false;
    }

    getMultiEdgesOffset() : number {
        return Edge.OFFSET_BETWEEN_MULTIEDGES;
    }


    clone(): Edge {
        const newEdge = new Edge(this.node1, this.node2, this.vertex1, this.vertex2, this.middlePoint);
        return newEdge;
    }


}