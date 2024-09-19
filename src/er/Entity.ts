import { Segment } from "../utils/Segment";
import Vector2D from "../utils/Vector2D";
import Attribute from "./Attribute";
import Connectable from "./Connectable";
import { ConnectionPoint } from "./ConnectionPoint";
import Relationship from "./Relationship";
import ShapeWithAttributes from "./ShapeWithAttributes";

export default class Entity extends ShapeWithAttributes {

    static HALF_DIM_X: number = 50;
    static HALF_DIM_Y: number = 30;

    relationships: Relationship[];
    identifierConnPoints: ConnectionPoint[];

    constructor(centerPoint: Vector2D, label: string) {
        super(centerPoint, label, Entity.HALF_DIM_X, Entity.HALF_DIM_Y);
        this.relationships = [];
        this.identifierConnPoints = [];
    }

    linkRelationship(r: Relationship): void {
        this.occupyConnectionPoint(this.findConnectionPointFor(r).pos, r);
        this.relationships.push(r);
    }

    isTheNearestConnectionPoint(p: Vector2D, connPoint: Vector2D): boolean {
        const currDist = connPoint.distanceTo(p);
        return (currDist <= Math.hypot(this.deltaX, this.deltaY) / 2);
    }

    getCorners(): Vector2D[] {
        return [
            new Vector2D(this.centerPoint.x - Entity.HALF_DIM_X, this.centerPoint.y - Entity.HALF_DIM_Y), //Top Left
            new Vector2D(this.centerPoint.x + Entity.HALF_DIM_X, this.centerPoint.y - Entity.HALF_DIM_Y), //Top Right
            new Vector2D(this.centerPoint.x + Entity.HALF_DIM_X, this.centerPoint.y + Entity.HALF_DIM_Y), //Bottom Right
            new Vector2D(this.centerPoint.x - Entity.HALF_DIM_X, this.centerPoint.y + Entity.HALF_DIM_Y), //Bottom Left
        ];
    }

    draw(ctx: CanvasRenderingContext2D): void {
        //Draw Rectangle
        const rectangleVertices = this.getCorners();
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(rectangleVertices[rectangleVertices.length - 1].x, rectangleVertices[rectangleVertices.length - 1].y);
        for (const v of rectangleVertices) {
            ctx.lineTo(v.x, v.y);
        }
        ctx.fill();
        ctx.stroke();

        //Draw Label
        ctx.fillStyle = "black";
        ctx.font = this.labelFontSize + "px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.label, this.centerPoint.x, this.centerPoint.y);

        //Draw Attributes
        super.draw(ctx);

        //Draw Primary Key
        if (this.identifierConnPoints.length > 1) {
            const composedIdentifierPath = this.getComposedIdentifierPath();
            const lastPoint = composedIdentifierPath[composedIdentifierPath.length - 1];

            ctx.beginPath();
            for (const v of composedIdentifierPath) {
                ctx.lineTo(v.x, v.y);
            }
            ctx.stroke();

            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(lastPoint.x, lastPoint.y, Attribute.CIRCLE_SIZE, 0, 2 * Math.PI, true);
            ctx.stroke();
            ctx.fill();
        }
    }

    generateConnectionPoints(): void {
        this.connectionPoints = new Map<string, ConnectionPoint>();
        const corners = this.getCorners();

        // Top Points (Left to Right)
        for (let x = corners[0].x + this.deltaX; x < corners[1].x; x += this.deltaX) {
            const cp = { pos: new Vector2D(x, corners[0].y), value: null, outDirection: - Math.PI / 2 };
            this.connectionPoints.set(cp.pos.toString(), cp);
        }

        // Right Points (Top to Bottom)
        for (let y = corners[1].y + this.deltaY; y < corners[2].y; y += this.deltaY) {
            const cp = { pos: new Vector2D(corners[1].x, y), value: null, outDirection: 0 };
            this.connectionPoints.set(cp.pos.toString(), cp);
        }

        // Bottom Points (Right to Left) 
        for (let x = corners[2].x - this.deltaX; x > corners[3].x; x -= this.deltaX) {
            const cp = { pos: new Vector2D(x, corners[2].y), value: null, outDirection: Math.PI / 2 };
            this.connectionPoints.set(cp.pos.toString(), cp);
        }

        // Left Points (Bottom to Top)
        for (let y = corners[3].y - this.deltaY; y > corners[0].y; y -= this.deltaY) {
            const cp = { pos: new Vector2D(corners[3].x, y), value: null, outDirection: Math.PI };
            this.connectionPoints.set(cp.pos.toString(), cp);
        }
    }

    calculateLabelSize(): number {
        const BORDER: number = 15;
        const ctx = document.createElement("canvas").getContext("2d")!; // Fictionary context to measure label length
        let fontSize = Entity.HALF_DIM_X;

        do {
            ctx.font = fontSize + "px serif";
            fontSize -= 3;
        } while (ctx.measureText(this.label).width > (Entity.HALF_DIM_X - BORDER) * 2);

        return fontSize;
    }

    setPrimaryKey(involvedConnectables: Connectable[]): void {
        const relationships: Relationship[] = involvedConnectables.filter((c) => c instanceof Relationship);
        const attributes: Attribute[] = involvedConnectables.filter((c) => c instanceof Attribute);

        switch (relationships.length) {
            case 0:
                this.setAttributesAsIdentifier(attributes);
                break;
            default:
                throw new Error("External Identifiers are currently not implemented");
        }
    }

    setAttributesAsIdentifier(attributes: Attribute[]): void {
        const attributesConnPoints: ConnectionPoint[] = attributes.map((a) => this.getCurrentConnectionPointFor(a));
        const allConnPoints = this.getAllConnectionPoints();

        if (attributes.length == 1) {
            attributes[0].filledPoint = true;
            this.identifierConnPoints = attributesConnPoints;
            return;
        }


        let countConsecutiveSpaces: number = 0;
        let foundConnPoints: ConnectionPoint[] = [];
        for (const connPoint of allConnPoints) {
            if (connPoint.value instanceof Relationship) {
                countConsecutiveSpaces = 0;
                foundConnPoints = [];
                continue;
            }
            countConsecutiveSpaces++;
            foundConnPoints.push(connPoint);
            if (countConsecutiveSpaces >= attributes.length)
                break;
        }

        if (countConsecutiveSpaces < attributes.length)
            throw new Error("We've got a problem");


        for (let i = 0; i < attributesConnPoints.length; i++) {
            const attribute = attributes[i];
            const oldConnPoint = this.getCurrentConnectionPointFor(attribute);
            const newConnPoint = foundConnPoints[i];
            const otherConnectable = newConnPoint.value;

            [oldConnPoint.value, newConnPoint.value] = [newConnPoint.value, oldConnPoint.value];
            attribute.setConnectedPoint(newConnPoint);
            if (otherConnectable instanceof Attribute)
                otherConnectable.setConnectedPoint(oldConnPoint);
        }

        this.identifierConnPoints = foundConnPoints;
    }

    getComposedIdentifierPath(): Vector2D[] {
        const passingPoints: Vector2D[] = this.identifierConnPoints.map((cp) => (cp.value as Attribute).getMiddleSegmentPoint());
        const identifierPath: Vector2D[] = [passingPoints[0]];

        let prevPoint = passingPoints[0];
        for (let i = 1; i < passingPoints.length; i++) {
            const currPoint = passingPoints[i];
            if (!(prevPoint.x == currPoint.x || prevPoint.y == currPoint.y)) {
                identifierPath.push(new Vector2D(prevPoint.x, currPoint.y));
            }
            identifierPath.push(currPoint);

            prevPoint = currPoint;
        }

        const firstPoint = Vector2D.sum(identifierPath[0], Vector2D.fromPolar(8, Segment.fromVectors(identifierPath[0], identifierPath[1]).getDirection()));
        const lastPoint = Vector2D.sum(identifierPath[identifierPath.length - 1], Vector2D.fromPolar(10, Segment.fromVectors(identifierPath[identifierPath.length - 1], identifierPath[identifierPath.length - 2]).getDirection()));
        return [firstPoint, ...identifierPath, lastPoint];
    }


}