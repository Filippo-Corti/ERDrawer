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
        const controlPoint: Vector2D = new Vector2D(
            2 * this.middlePoint.x - 0.5 * this.vertex1.x - 0.5 * this.vertex2.x,
            2 * this.middlePoint.y - 0.5 * this.vertex1.y - 0.5 * this.vertex2.y
        );

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
        this.middlePoint = new Vector2D((this.vertex1.x + this.vertex2.x) / 2, (this.vertex1.y + this.vertex2.y) / 2);
    }

    //Returns the Segment corresponding to this Edge. It doesn't take the exact center of the node,
    // but a point next to it that sits on the edge.
    //If number > 1, only the "main" segment is returned.
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

    clone(): Edge {
        const newEdge = new Edge(this.node1, this.node2, this.vertex1, this.vertex2, this.middlePoint);
        return newEdge;
    }


}