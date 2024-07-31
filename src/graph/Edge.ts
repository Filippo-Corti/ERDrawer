import { Drawable } from "../utils/Drawable";
import { Segment } from "../utils/Segment";
import { Vector2D } from "../utils/Vector2D";
import { Node } from "./Node";

export class Edge implements Drawable {

    node1: Node;
    node2: Node;
    count: number;
    //Vertex 1 and 2 are the extreme points of the edge
    vertex1: Vector2D;
    vertex2: Vector2D;

    static DRAWING_RADIUS: number = 50;

    constructor(node1: Node, node2: Node, count: number = 1, vertex1?: Vector2D, vertex2?: Vector2D) {
        this.node1 = node1;
        this.node2 = node2;
        this.count = count;

        //Vertex are initialized based on the segment that connects central positions of node1 and node2

        let v1: Vector2D | null = null, v2: Vector2D | null = null;
        if (!vertex1) {
            v1 = this.node1.occupyConnectionPointBySegment(Segment.fromVectors(node1.pos, node2.pos));
            if (!v1) {
                throw new Error("Error finding a connection point for the edge");
            }
        }

        if (!vertex2) {
            v2 = this.node2.occupyConnectionPointBySegment(Segment.fromVectors(node1.pos, node2.pos));
            if (!v2) {
                throw new Error("Error finding a connection point for the edge");
            }
        }

        this.vertex1 = vertex1 ? vertex1 : v1!;
        this.vertex2 = vertex2 ? vertex2 : v2!;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const OFFSET_BETWEEN_MULTIEDGES = 100; //In the center
        const mx = (this.vertex2.x + this.vertex1.x) / 2;
        const my = (this.vertex2.y + this.vertex1.y) / 2;
        for (let i = 0; i < this.count; i++) {
            // Calculate offset
            const theta = Math.atan2(this.vertex2.y - this.vertex1.y, this.vertex2.x - this.vertex1.x);
            const offsetFactor = (i - (this.count - 1) / 2);
            const dx = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * Math.sin(theta);
            const dy = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * -Math.cos(theta);

            // Draw Edge
            ctx.beginPath();
            ctx.moveTo(this.vertex1.x, this.vertex1.y);
            ctx.lineTo(mx + dx, my + dy);
            ctx.lineTo(this.vertex2.x, this.vertex2.y);
            ctx.stroke();

        }
    }

    //Vertex are calculated based on the segment that connects central positions of node1 and node2
    calculateNewVertices(): void {
        const v1 = this.node1.occupyConnectionPointBySegment(Segment.fromVectors(this.node1.pos, this.node2.pos));
        const v2 = this.node2.occupyConnectionPointBySegment(Segment.fromVectors(this.node1.pos, this.node2.pos));

        if (!v1 || !v2) {
            throw new Error("Error finding a connection point for the edge");
        }

        this.vertex1 = v1;
        this.vertex2 = v2;
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
        const newEdge = new Edge(this.node1, this.node2, this.count, this.vertex1, this.vertex2);
        return newEdge;
    }


}