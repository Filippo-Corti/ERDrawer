import { Segment } from "../utils/Segment";
import { Random } from "../utils/Utils";
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
        if (this.identifierConnPoints.length > 1 || this.identifierConnPoints.some((cp) => cp.value instanceof Relationship)) {
            const composedIdentifierPath = this.getComposedIdentifierPath();
            const lastPoint = composedIdentifierPath[composedIdentifierPath.length - 1];

            ctx.beginPath();
            for (const v of composedIdentifierPath) {
                ctx.lineTo(v.x, v.y);
            }
            ctx.stroke();

            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(lastPoint.x, lastPoint.y, Math.min(Attribute.CIRCLE_SIZE, Math.min(this.deltaX, this.deltaY) / 2), 0, 2 * Math.PI, true);
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
            case 1:
                this.setOneRelationshipAndAttributesAsIdentifier(relationships[0], attributes);
                break;
            case 2:
                this.setTwoRelationshipsAndAttributesAsIdentifier(relationships[0], relationships[1], attributes);
                break;
            default:
                throw new Error("External Identifiers with 3+ Relationship involved are currently not implemented");
        }
    }

    private setAttributesAsIdentifier(attributes: Attribute[]): void {
        const attributesConnPoints: ConnectionPoint[] = attributes.map((a) => this.getCurrentConnectionPointFor(a));

        if (attributes.length == 1) {
            attributes[0].filledPoint = true;
            this.identifierConnPoints = attributesConnPoints;
            return;
        }

        const foundConnPoints: ConnectionPoint[] = this.getAvailableConnectionPointsSequence(attributes.length);

        this.updateConnectionPointsFor(attributes, foundConnPoints);
        this.identifierConnPoints = foundConnPoints;
    }

    private setOneRelationshipAndAttributesAsIdentifier(relationship: Relationship, attributes: Attribute[]): void {
        const relationshipConnPoint: ConnectionPoint = this.getCurrentConnectionPointFor(relationship);
        let leftConnPoint = this.getPreviousConnectionPoint(relationshipConnPoint.pos);
        let rightConnPoint = this.getNextConnectionPoint(relationshipConnPoint.pos);
        let foundConnPointsLeft: ConnectionPoint[] = [];
        let foundConnPointsRight: ConnectionPoint[] = [];
        let movingRelationshipsNeeded: boolean = false;

        while (leftConnPoint != rightConnPoint && this.getPreviousConnectionPoint(rightConnPoint.pos) != leftConnPoint) {

            if (foundConnPointsLeft.length + foundConnPointsRight.length >= attributes.length) {
                this.updateConnectionPointsFor(attributes, [...foundConnPointsLeft, ...foundConnPointsRight].splice(0, attributes.length));
                this.identifierConnPoints = [...foundConnPointsLeft, relationshipConnPoint, ...foundConnPointsRight].splice(0, attributes.length + 1);
                return;
            }

            let roomLeft: boolean = false, roomRight: boolean = false
            if (!(leftConnPoint.value instanceof Relationship) || movingRelationshipsNeeded) {
                foundConnPointsLeft = [leftConnPoint, ...foundConnPointsLeft];
                leftConnPoint = this.getPreviousConnectionPoint(leftConnPoint.pos);
                roomLeft = true;
            }
            if (!(rightConnPoint.value instanceof Relationship) || movingRelationshipsNeeded) {
                foundConnPointsRight = [...foundConnPointsRight, rightConnPoint];
                rightConnPoint = this.getNextConnectionPoint(rightConnPoint.pos);
                roomRight = true;
            }

            if (!(roomLeft || roomRight)) movingRelationshipsNeeded = true;
        }
        if (foundConnPointsLeft.length + foundConnPointsRight.length >= attributes.length) {
            this.updateConnectionPointsFor(attributes, [...foundConnPointsLeft, ...foundConnPointsRight].splice(0, attributes.length));
            this.identifierConnPoints = [...foundConnPointsLeft, relationshipConnPoint, ...foundConnPointsRight].splice(0, attributes.length + 1);
            return;
        }
        throw new Error("Couldn't find a way to identify this entity");
    }

    private setTwoRelationshipsAndAttributesAsIdentifier(relationship1: Relationship, relationship2: Relationship, attributes: Attribute[]): void {
        // const connPointR1 = this.getCurrentConnectionPointFor(relationship1);
        // const connPointR2 = this.getCurrentConnectionPointFor(relationship2);
        // let connPoints1 = [connPointR1, connPointR2];
        // let connPoints2 = [connPointR2, connPointR1];
        // let closestRelationshipsConnPoints1 = connPoints1;
        // let closestRelationshipsConnPoints2 = connPoints2;

        // console.log(this.getNextConnectionPoint(new Vector2D(750, 935)));
        // while (true) {
        //     // console.log("Prima:", connPoints1);
        //     connPoints1 = [this.getNextConnectionPoint(connPoints1[0].pos), this.getPreviousConnectionPoint(connPoints1[1].pos)];
        //     //console.log("Dopo:", connPoints1);

        //     //console.log("--------------");
        //     if (connPoints1[0].value instanceof Relationship)
        //         closestRelationshipsConnPoints1[0] = connPoints1[0];

        //     if (connPoints1[0] == connPoints1[1] || this.getNextConnectionPoint(connPoints1[0].pos) == connPoints1[1]) break;

        //     if (connPoints1[1].value instanceof Relationship)
        //         closestRelationshipsConnPoints1[1] = connPoints1[1];
        // }

        // while (true) {
        //     //console.log("B", connPoints2);
        //     connPoints2 = [this.getNextConnectionPoint(connPoints2[0].pos), this.getPreviousConnectionPoint(connPoints2[1].pos)];

        //     if (connPoints2[0].value instanceof Relationship)
        //         closestRelationshipsConnPoints2[0] = connPoints2[0];

        //     if (connPoints2[0] == connPoints2[1] || this.getPreviousConnectionPoint(connPoints2[0].pos) == connPoints2[1]) break;

        //     if (connPoints2[1].value instanceof Relationship)
        //         closestRelationshipsConnPoints2[1] = connPoints2[1];
        // }

        // console.log(closestRelationshipsConnPoints1);
        // console.log(closestRelationshipsConnPoints2);

        // // Count number of relationships found each way
        // // Choose the one with the least amount of relationships
        // // Eventually move the relationships
        // // But do the attributes fit? Mmmmh

        const relationshipConnPoint: ConnectionPoint = this.getCurrentConnectionPointFor(relationship1);
        let leftConnPoint = this.getPreviousConnectionPoint(relationshipConnPoint.pos);
        let rightConnPoint = this.getNextConnectionPoint(relationshipConnPoint.pos);
        let foundConnPointsLeft: ConnectionPoint[] = [];
        let foundConnPointsRight: ConnectionPoint[] = [];
        let movingRelationshipsNeeded: boolean = false;

        while (leftConnPoint != rightConnPoint && this.getPreviousConnectionPoint(rightConnPoint.pos) != leftConnPoint) {

            if (foundConnPointsLeft.length + foundConnPointsRight.length >= attributes.length + 1) {
                this.updateConnectionPointsFor([...attributes, relationship2], [...foundConnPointsLeft, ...foundConnPointsRight].splice(0, attributes.length + 1));
                this.identifierConnPoints = [...foundConnPointsLeft, relationshipConnPoint, ...foundConnPointsRight].splice(0, attributes.length + 2);
                return;
            }

            let roomLeft: boolean = false, roomRight: boolean = false
            if (!(leftConnPoint.value instanceof Relationship) || movingRelationshipsNeeded) {
                foundConnPointsLeft = [leftConnPoint, ...foundConnPointsLeft];
                leftConnPoint = this.getPreviousConnectionPoint(leftConnPoint.pos);
                roomLeft = true;
            }
            if (!(rightConnPoint.value instanceof Relationship) || movingRelationshipsNeeded) {
                foundConnPointsRight = [...foundConnPointsRight, rightConnPoint];
                rightConnPoint = this.getNextConnectionPoint(rightConnPoint.pos);
                roomRight = true;
            }

            if (!(roomLeft || roomRight)) movingRelationshipsNeeded = true;
        }
        if (foundConnPointsLeft.length + foundConnPointsRight.length >= attributes.length + 1) {
            this.updateConnectionPointsFor([...attributes, relationship2], [...foundConnPointsLeft, ...foundConnPointsRight].splice(0, attributes.length + 1));
            this.identifierConnPoints = [...foundConnPointsLeft, relationshipConnPoint, ...foundConnPointsRight].splice(0, attributes.length + 2);
            return;
        }
        console.log(foundConnPointsLeft, foundConnPointsRight);
        throw new Error("Couldn't find a way to identify this entity");
    }

    getComposedIdentifierPath(): Vector2D[] {
        const passingPoints: Vector2D[] = this.identifierConnPoints.map((cp) => {
            const deltaVector = Vector2D.fromPolar(15, cp.outDirection);
            return Vector2D.sum(cp.pos, deltaVector);
        });
        const identifierPath: Vector2D[] = [passingPoints[0]];

        let prevPoint = passingPoints[0];
        for (let i = 1; i < passingPoints.length; i++) {
            const currPoint = passingPoints[i];
            if (!(prevPoint.x == currPoint.x || prevPoint.y == currPoint.y)) {
                let cornerPoint = new Vector2D(prevPoint.x, currPoint.y);
                if (cornerPoint.distanceTo(this.centerPoint) < Math.hypot(Entity.HALF_DIM_X, Entity.HALF_DIM_Y))
                    cornerPoint = new Vector2D(currPoint.x, prevPoint.y);
                identifierPath.push(cornerPoint);
            }
            identifierPath.push(currPoint);

            prevPoint = currPoint;
        }

        let dir1 = 0, dir2 = 0;
        if (this.identifierConnPoints.length == 1) { // Single Relationship case
            dir1 = this.identifierConnPoints[0].outDirection + Math.PI / 2;
            dir2 = this.identifierConnPoints[this.identifierConnPoints.length - 1].outDirection - Math.PI / 2
        } else {
            dir1 = Segment.fromVectors(identifierPath[0], identifierPath[1]).getDirection();
            dir2 = Segment.fromVectors(identifierPath[identifierPath.length - 1], identifierPath[identifierPath.length - 2]).getDirection();
        }

        const firstPoint = Vector2D.sum(identifierPath[0], Vector2D.fromPolar(7, dir1));
        const lastPoint = Vector2D.sum(identifierPath[identifierPath.length - 1], Vector2D.fromPolar(7, dir2));
        return [firstPoint, ...identifierPath, lastPoint];
    }

    private getAvailableConnectionPointsSequence(length: number): ConnectionPoint[] {
        let allConnPoints = Array.from(this.connectionPoints);
        let randIndex = Random.getRandom(0, allConnPoints.length - 1);
        allConnPoints = [...allConnPoints.slice(randIndex), ...allConnPoints.slice(0, randIndex)]; // Start from random point

        const allSequences: ConnectionPoint[][] = [];
        let currentSequence: ConnectionPoint[] = [];

        for (const [_, connPoint] of allConnPoints) {
            if (connPoint.value instanceof Relationship) {
                allSequences.push(currentSequence);
                currentSequence = [];
                continue;
            }
            currentSequence.push(connPoint);
            if (currentSequence.length >= length)
                return currentSequence;
        }
        allSequences.push(currentSequence);

        const firstLastSequence: ConnectionPoint[] = [...allSequences[allSequences.length - 1], ...allSequences[0]];
        if (firstLastSequence.length >= length) {
            return firstLastSequence.splice(0, length);
        }

        throw new Error("No such sequence could be found");
    }

    private updateConnectionPointsFor(connectables: Connectable[], newConnectionPoints: ConnectionPoint[]) {
        for (let i = 0; i < connectables.length; i++) {
            const connectable = connectables[i];
            const oldConnPoint = this.getCurrentConnectionPointFor(connectable);
            const newConnPoint = newConnectionPoints[i];
            const otherConnectable = newConnPoint.value;

            [oldConnPoint.value, newConnPoint.value] = [newConnPoint.value, oldConnPoint.value];
            if (connectable instanceof Attribute)
                connectable.setConnectedPoint(newConnPoint);
            if (otherConnectable instanceof Attribute)
                otherConnectable.setConnectedPoint(oldConnPoint);
        }
    }


}