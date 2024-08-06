import { Edge } from "../graph/Edge";
import { Node } from "../graph/Node";
import { Segment } from "../utils/Segment";
import { Vector2D } from "../utils/Vector2D";
import { Entity } from "./Entity";

export class BinaryRelationship extends Edge {

    label: string;
    halfDiagX: number = 70;
    halfDiagY: number = 50;

    static OFFSET_BETWEEN_MULTIEDGES: number = 100;


    constructor(node1: Node, node2: Node, label: string, vertex1?: Vector2D, vertex2?: Vector2D, middlePoint?: Vector2D) {
        super(node1, node2, vertex1, vertex2, middlePoint);
        this.label = label;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const PADDING = 15;

        if (!this.vertex1 || !this.vertex2) {
            throw new Error("Couldn't find a Connection Point!");
        }
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

        // Draw Rhombus half way
        const rhombusVertices = this.getRhombusVertices(this.middlePoint);
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(rhombusVertices[rhombusVertices.length - 1].x, rhombusVertices[rhombusVertices.length - 1].y);
        for (const v of rhombusVertices) {
            ctx.lineTo(v.x, v.y);
        }
        ctx.fill();
        ctx.stroke();
        
        /*for (let i = 0; i < this.count; i++) {
            const mx = (this.vertex2.x + this.vertex1.x) / 2;
            const my = (this.vertex2.y + this.vertex1.y) / 2;
            const corners = this.getCorners();
            // Calculate offset
            const theta = Math.atan2(this.vertex2.y - this.vertex1.y, this.vertex2.x - this.vertex1.x);
            const offsetFactor = (i - (this.count - 1) / 2);
            const dx = BinaryRelationship.OFFSET_BETWEEN_MULTIEDGES * offsetFactor * Math.sin(theta);
            const dy = BinaryRelationship.OFFSET_BETWEEN_MULTIEDGES * offsetFactor * -Math.cos(theta);

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
                rhombusCorners.push(Vector2D.sum(p, Vector2D.fromPolar(20, dir)));
            })
            points.push(this.vertex1);
            points.push(corners[0]);
            if (rhombusCorners.length > 0) {
                points.push(rhombusCorners[0]);
                points.push(rhombusConnPoints[0]);
                points.push(rhombusCenterPoint);
                points.push(rhombusConnPoints[1]);
                points.push(rhombusCorners[1]);
            } else { // Only happens when nodes are too close to each other
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

            // if (i != this.count - 1)
            //     this.calculateNewVertices();
        }*/
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

    // Return edge's first corners
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

    getMultiEdgesOffset() : number {
        return BinaryRelationship.OFFSET_BETWEEN_MULTIEDGES;
    }


    clone(): BinaryRelationship {
        return new BinaryRelationship(this.node1, this.node2, this.label, this.vertex1, this.vertex2, this.middlePoint);
    }


}