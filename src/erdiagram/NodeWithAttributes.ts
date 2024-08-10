import { Graph } from "../graph/Graph";
import { Node } from "../graph/Node";
import { Segment } from "../utils/Segment";
import { ConnectionPoint } from "../utils/Utils";
import { Vector2D } from "../utils/Vector2D";
import { Attribute } from "./Attribute";

export abstract class NodeWithAttributes extends Node {

    connectionPoints: ConnectionPoint[]; // Vector2D Hashcode to boolean
    abstract deltaConnectionPointsX: number;
    abstract deltaConnectionPointsY: number;
    attributes: Map<string, Attribute>;

    constructor(graph: Graph, label: string, x: number, y: number, size: number = 30, attributes: string[] = []) {
        super(graph, label, x, y, size);
        this.connectionPoints = [];
        const connPoints = this.getAllConnectionPoints();
        connPoints.forEach((p) => this.connectionPoints.push({ p: p, empty: true }));
        this.attributes = new Map<string, Attribute>;
        attributes.forEach(a => this.attributes.set(a, new Attribute(a, this.pos))); //Default position is center of the entity
    }

    abstract getAllConnectionPoints(): Vector2D[];

    abstract occupyClosestConnectionPoint(point: Vector2D, sameSegmentRequired?: boolean): Vector2D | null;
    abstract occupyClosestConnectionPoint(segment: Segment, sameSegmentRequired?: boolean): Vector2D | null;

    abstract resetDeltas() : void;

    abstract reduceDeltas() : boolean;

    isAConnectionPoint(p: Vector2D): boolean {
        return this.connectionPoints.find((cp) => cp.p.x == p.x && cp.p.y == p.y) !== undefined;
    }

    isConnectionPointOccupied(p: Vector2D): boolean {
        const found = this.connectionPoints.find((cp) => cp.p.x == p.x && cp.p.y == p.y);
        if (!found) {
            throw new Error("P is not a connection point");
        }
        return !found.empty;
    }

    setConnectionPoint(p: Vector2D, empty: boolean): void {
        const found = this.connectionPoints.find((cp) => cp.p.x == p.x && cp.p.y == p.y);
        if (!found) {
            throw new Error("P is not a connection point");
        }
        found.empty = empty;
    }

    // Empty Connection Points map and reset deltas
    // It also resets attributes positions
    resetConnectionPoints(): void {
        this.connectionPoints = [];
        const connPoints = this.getAllConnectionPoints();
        connPoints.forEach((p) => this.connectionPoints.push({ p: p, empty: true }));
        this.attributes.forEach(a => {
            a.startingPoint = this.pos;
            a.direction = 0;
        });
        this.resetDeltas();
    }

    addAttribute(label: string, filledPoint: boolean = false) {
        this.attributes.set(label, new Attribute(label, this.pos, filledPoint));
    }

}