import Vector2D from "../utils/Vector2D";
import Attribute from "./Attribute";
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

    getAttribute(label: string): Attribute {
        const found = this.attributes.find((a) => a.label == label);
        if (found)
            return found;

        throw new Error("Attribute " + label + " not in " + this.label);
    }

    updateCenterPoint(newCenterPoint: Vector2D): void {
        if (this.centerPoint.equals(newCenterPoint)) return;

        const centerPointsDiff = Vector2D.sum(newCenterPoint, this.centerPoint.negative());
        const newConnectionPoints: Map<string, ConnectionPoint> = new Map<string, ConnectionPoint>();
        const attributes = this.attributes.map((a) => ({ label: a.label, filledPoint: a.filledPoint }));

        for (const [_, oldCP] of this.connectionPoints) {
            const newPoint = Vector2D.sum(oldCP.pos, centerPointsDiff);
            oldCP.pos = newPoint;
            oldCP.value = null;
            newConnectionPoints.set(newPoint.toString(), oldCP)
        }

        this.centerPoint = newCenterPoint;
        this.connectionPoints = newConnectionPoints;

        for (const a of attributes) {
            const attribute = new Attribute(a.label, a.filledPoint);
            this.addAttribute(attribute);
        }
    }

}