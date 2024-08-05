import { Edge } from "../graph/Edge";
import { Node } from "../graph/Node";
import { Segment } from "../utils/Segment";
import { Vector2D } from "../utils/Vector2D";
import { Entity } from "./Entity";

export class BinaryRelationship extends Edge {

    labels: string[];
    halfDiagX: number = 70;
    halfDiagY: number = 50;

    constructor(node1: Node, node2: Node, count: number = 1, labels: string[], vertex1?: Vector2D, vertex2?: Vector2D) {
        super(node1, node2, count, vertex1, vertex2);
        this.labels = [];
        if (labels.length < count) {
            console.log(node1.label, node2.label, count, labels);
            throw new Error("Not enough labels");
        }
        for (let i = 0; i < count; i++) {
            this.labels.push(labels[i]);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const OFFSET_BETWEEN_MULTIEDGES = 150; //In the center
        const PADDING = 15;
        const corners = this.getCorners();

        if (!this.vertex1 || !this.vertex2) {
            throw new Error("Couldn't find a Connection Point!");
        }

        const mx = (this.vertex2.x + this.vertex1.x) / 2;
        const my = (this.vertex2.y + this.vertex1.y) / 2;
        for (let i = 0; i < this.count; i++) {
            // Calculate offset
            const theta = Math.atan2(this.vertex2.y - this.vertex1.y, this.vertex2.x - this.vertex1.x);
            const offsetFactor = (i - (this.count - 1) / 2);
            const dx = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * Math.sin(theta);
            const dy = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * -Math.cos(theta);

            // Calculate Passing Points
            let points: Vector2D[] = [];
            const rhombusCenterPoint = new Vector2D(mx + dx, my + dy);
            const rhombusConnPoints =
                this.findRhombusConnectionPoints(rhombusCenterPoint, Segment.fromVectors(corners[0], rhombusCenterPoint))
                    .concat(this.findRhombusConnectionPoints(rhombusCenterPoint, Segment.fromVectors(corners[1], rhombusCenterPoint)));
            rhombusConnPoints.sort((v1, v2) => v1.distanceTo(this.vertex1) - v2.distanceTo(this.vertex1)); // Order them correctly
            const rhombusCorners: Vector2D[] = [];
            rhombusConnPoints.forEach(p => {
                const dir = [- Math.PI / 2, 0, + Math.PI / 2, Math.PI][this.getRhombusVertices(rhombusCenterPoint).map(v => v.toString()).indexOf(p.toString())];
                console.log(p, dir);
                rhombusCorners.push(Vector2D.sum(p, Vector2D.fromPolar(20, dir)));
            })
            console.log(this.labels, rhombusCorners);
            points.push(this.vertex1);
            points.push(corners[0]);
            if (rhombusCorners.length > 0) {
                points.push(rhombusCorners[0]);
                points.push(rhombusConnPoints[0]);
                points.push(rhombusCenterPoint);
                points.push(rhombusConnPoints[1]);
                points.push(rhombusCorners[1]);
            } else {
                points.push(rhombusCenterPoint);
            }
            points.push(corners[1]);
            points.push(this.vertex2);

            // Draw Edge
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (const v of points) {
                ctx.lineTo(v.x, v.y);
            }
            ctx.stroke();

            // Draw Rhombus half way
            const rhombusVertices = this.getRhombusVertices(new Vector2D(mx + dx, my + dy));
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.moveTo(rhombusVertices[rhombusVertices.length - 1].x, rhombusVertices[rhombusVertices.length - 1].y);
            for (const v of rhombusVertices) {
                ctx.lineTo(v.x, v.y);
            }
            ctx.fill();
            ctx.stroke();

            //Draw Label
            ctx.fillStyle = "black";
            let fontSize = this.halfDiagX * 1.25;
            do {
                ctx.font = fontSize + "px serif";
                fontSize -= 3;
            } while (ctx.measureText(this.labels[i]).width > (this.halfDiagX * 1.25 - PADDING));
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.labels[i], mx + dx, my + dy);

        }
    }

    getRhombusVertices(centerPoint: Vector2D): Vector2D[] {
        return [
            new Vector2D(centerPoint.x, centerPoint.y - this.halfDiagY),
            new Vector2D(centerPoint.x + this.halfDiagX, centerPoint.y),
            new Vector2D(centerPoint.x, centerPoint.y + this.halfDiagY),
            new Vector2D(centerPoint.x - this.halfDiagX, centerPoint.y),
        ];
    }

    getRhombusSegments(centerPoint: Vector2D): Segment[] {
        const vertices = this.getRhombusVertices(centerPoint);
        return [
            Segment.fromVectors(vertices[0], vertices[1]),
            Segment.fromVectors(vertices[1], vertices[2]),
            Segment.fromVectors(vertices[2], vertices[3]),
            Segment.fromVectors(vertices[3], vertices[0])
        ]
    }

    // Return edge's corners
    getCorners(): Vector2D[] {
        const distToVertex = 70;
        const corners: Vector2D[] = [];
        let edgeDirection = (this.node1 as Entity).getRectangleSegmentByPoint(this.vertex1)!.getDirection() + Math.PI / 2;
        corners.push(Vector2D.sum(this.vertex1, Vector2D.fromPolar(distToVertex, edgeDirection)));
        edgeDirection = (this.node2 as Entity).getRectangleSegmentByPoint(this.vertex2)!.getDirection() + Math.PI / 2;
        corners.push(Vector2D.sum(this.vertex2, Vector2D.fromPolar(distToVertex, edgeDirection)));
        return corners;
    }

    // Returns the two rhombus vertices connected to the edge
    findRhombusConnectionPoints(rhombusCenterPoint: Vector2D, crossingEdge: Segment): Vector2D[] {
        const rhombusVertices = this.getRhombusVertices(rhombusCenterPoint);
        const rhombusSegments = this.getRhombusSegments(rhombusCenterPoint);
        const connPoints: Vector2D[] = [];
        for (const s of rhombusSegments) {
            // Check if the edge and the rhombus segment intersect
            const intersection = crossingEdge.getIntersection(s);
            if (!intersection) continue;
            let minDist = Number.MAX_VALUE;
            let minPoint: Vector2D | null = null;

            // Find closest vertice if they do
            for (const v of rhombusVertices) {
                let dist = intersection.distanceTo(v);
                if (dist <= minDist) {
                    minDist = dist;
                    minPoint = v;
                }
            }
            connPoints.push(minPoint!);
        }
        return connPoints;
    }


    clone(): BinaryRelationship {
        return new BinaryRelationship(this.node1, this.node2, this.count, this.labels, this.vertex1, this.vertex2);
    }


}