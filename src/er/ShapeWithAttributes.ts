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

}