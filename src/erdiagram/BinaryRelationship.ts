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

    // Node1 -- W ------- X -- <Rhombus> -- Y ------- Z -- Node2 
    draw(ctx: CanvasRenderingContext2D): void {
        const LABEL_PADDING = 15;

        if (!this.vertex1 || !this.vertex2) {
            throw new Error("Couldn't find a Connection Point!");
        }

        // Get the Drawing Path
        let points: Vector2D[] = this.samplePoints(0);

        // Draw the Path
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (const v of points) {
            ctx.lineTo(v.x, v.y);
        }
        ctx.stroke();

        // Draw Rhombus in the MiddlePoint
        const rhombusVertices = this.getRhombusVertices();
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
        } while (ctx.measureText(this.label).width > (this.halfDiagX * 1.25 - LABEL_PADDING));
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.label, this.middlePoint.x, this.middlePoint.y);

    }

    getRhombusVertices(): Vector2D[] {
        return [
            new Vector2D(this.middlePoint.x, this.middlePoint.y - this.halfDiagY),
            new Vector2D(this.middlePoint.x + this.halfDiagX, this.middlePoint.y),
            new Vector2D(this.middlePoint.x, this.middlePoint.y + this.halfDiagY),
            new Vector2D(this.middlePoint.x - this.halfDiagX, this.middlePoint.y),
        ];
    }

    getRhombusSegments(): Segment[] {
        const vertices = this.getRhombusVertices();
        return [
            Segment.fromVectors(vertices[0], vertices[1]),
            Segment.fromVectors(vertices[1], vertices[2]),
            Segment.fromVectors(vertices[2], vertices[3]),
            Segment.fromVectors(vertices[3], vertices[0])
        ]
    }

    // Returns the rhombus vertices connected to the edge, given the points W and Z
    getRhombusConnectionPoints(w: Vector2D, z: Vector2D): Vector2D[] {
        const rhombusSegments = this.getRhombusSegments();
        const connPoints: Vector2D[] = [];
        const crossingEdge1: Segment = Segment.fromVectors(w, this.middlePoint);
        const crossingEdge2: Segment = Segment.fromVectors(this.middlePoint, z);

        for (const s of rhombusSegments) {
            // Check if the edges and the rhombus segment intersect
            const intersection1 = crossingEdge1.getIntersection(s);
            if (intersection1) {
                const dist1 = s.a.distanceTo(intersection1);
                const dist2 = s.b.distanceTo(intersection1);
                connPoints.push((dist1 < dist2) ? s.a : s.b);
            }
            const intersection2 = crossingEdge2.getIntersection(s);
            if (intersection2) {
                const dist1 = s.a.distanceTo(intersection2);
                const dist2 = s.b.distanceTo(intersection2);
                connPoints.push((dist1 < dist2) ? s.a : s.b);
            }
        }

        connPoints.sort((v1, v2) => v1.distanceTo(this.vertex1) - v2.distanceTo(this.vertex1)); // Order them correctly
        return connPoints;
    }

    getMultiEdgesOffset(): number {
        return BinaryRelationship.OFFSET_BETWEEN_MULTIEDGES;
    }

    samplePoints(_numSamples: number): Vector2D[] {
        const distToVertex = 70; // Length of "--"

        // Build the Drawing Path
        const dirFromNode1 = (this.node1 as Entity).getRectangleSegmentByPoint(this.vertex1)!.getDirection() + Math.PI / 2;
        const dirFromNode2 = (this.node2 as Entity).getRectangleSegmentByPoint(this.vertex2)!.getDirection() + Math.PI / 2;

        const w = Vector2D.sum(this.vertex1, Vector2D.fromPolar(distToVertex, dirFromNode1));
        const z = Vector2D.sum(this.vertex2, Vector2D.fromPolar(distToVertex, dirFromNode2));

        let rhombusConnPoints = this.getRhombusConnectionPoints(w, z);
        if (rhombusConnPoints.length < 2) { // Fallback if the nodes are too close to each other. Shouldn't happen
            rhombusConnPoints = [this.middlePoint, this.middlePoint];
        } else if (rhombusConnPoints.length == 4) { // Happens when 2 segments intersect the same edge, due to it being on the corner
            rhombusConnPoints = [rhombusConnPoints[0], rhombusConnPoints[2]];
        }
        const dirFromConnPoint1 = [- Math.PI / 2, 0, + Math.PI / 2, Math.PI][this.getRhombusVertices().map(v => v.toString()).indexOf(rhombusConnPoints[0].toString())];
        const dirFromConnPoint2 = [- Math.PI / 2, 0, + Math.PI / 2, Math.PI][this.getRhombusVertices().map(v => v.toString()).indexOf(rhombusConnPoints[1].toString())];

        const x = Vector2D.sum(rhombusConnPoints[0], Vector2D.fromPolar(distToVertex, dirFromConnPoint1));
        const y = Vector2D.sum(rhombusConnPoints[1], Vector2D.fromPolar(distToVertex, dirFromConnPoint2));

        let points: Vector2D[] = [
            this.vertex1, // Node1
            w, // W
            x, // X
            rhombusConnPoints[0], // <
            this.middlePoint, // Rhombus
            rhombusConnPoints[1], // >
            y, // Y
            z, // Z
            this.vertex2 // Node2
        ];
        return points;
    }


    clone(): BinaryRelationship {
        return new BinaryRelationship(this.node1, this.node2, this.label, this.vertex1, this.vertex2, this.middlePoint);
    }


}