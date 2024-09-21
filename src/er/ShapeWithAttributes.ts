import { Random } from "../utils/Utils";
import Vector2D from "../utils/Vector2D";
import Attribute from "./Attribute";
import Connectable from "./Connectable";
import { ConnectionPoint } from "./ConnectionPoint";
import Shape from "./Shape";

export default abstract class ShapeWithAttributes extends Shape {

    attributes: Attribute[];

    constructor(centerPoint: Vector2D, label: string, deltaX: number, deltaY: number) {
        super(centerPoint, label, deltaX, deltaY);
        this.attributes = [];
    }

    draw(ctx: CanvasRenderingContext2D): void {
        for (const attr of this.attributes) {
            attr.draw(ctx);
        }
    }

    addAttribute(a: Attribute): void {
        const found = this.findConnectionPointFor(a);
        this.occupyConnectionPoint(found.pos, a);
        this.attributes.push(a);
        a.linkToConnectable(this);
    }

    getAttribute(label : string) : Attribute {
        const found = this.attributes.find((a) => a.label == label);
        if (found)
            return found;

        throw new Error("Attribute " + label + " not in " + this.label);
    }

    findConnectionPointFor(c: Connectable, closestSegment: boolean = true): ConnectionPoint {
        if (!(c instanceof Attribute)) {
            return super.findConnectionPointFor(c, closestSegment);
        }

        const allConnPoints = this.getAllConnectionPoints();
        const availableConnPoints: ConnectionPoint[] = [];

        for (const cp of allConnPoints) {
            if (cp.value !== null) continue;
            availableConnPoints.push(cp);
        }

        if (availableConnPoints.length == 0) {
            if (this.reduceDeltasAndRegenerate()) {
                return this.findConnectionPointFor(c, closestSegment);
            }
            else
                throw new Error("Couldn't find room for this attribute");
        }

        return availableConnPoints[Random.getRandom(0, availableConnPoints.length - 1)];
    }

    updateCenterPoint(newCenterPoint: Vector2D): void {
        if (this.centerPoint.equals(newCenterPoint)) return;

        const centerPointsDiff = Vector2D.sum(newCenterPoint, this.centerPoint.negative());
        const newConnectionPoints: Map<string, ConnectionPoint> = new Map<string, ConnectionPoint>();

        for (const [_, oldCP] of this.connectionPoints) {
            const newPoint = Vector2D.sum(oldCP.pos, centerPointsDiff);
            oldCP.pos = newPoint;
            newConnectionPoints.set(newPoint.toString(), oldCP)
            if (oldCP.value instanceof Attribute) 
                oldCP.value.setConnectedPoint(oldCP);
        }

        this.centerPoint = newCenterPoint;
        this.connectionPoints = newConnectionPoints;
    }

}