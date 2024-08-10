import { Drawable } from "../utils/Drawable";
import { Segment } from "../utils/Segment";
import { Vector2D } from "../utils/Vector2D";
import { Graph } from "./Graph";

export class Node implements Drawable {

    graph : Graph;
    label : string;
    pos : Vector2D;
    disp : Vector2D;
    size : number;

    constructor(graph : Graph, label: string, x: number, y: number, size : number = 30) {
        this.graph = graph;
        this.label = label;
        this.pos = new Vector2D(x, y);
        this.disp = new Vector2D(0, 0);
        this.size = size;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const PADDING = (this.label.length < 5) ? 15 : 4;
        //Draw Circle
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        //Draw Label
        ctx.fillStyle = "black";
        let fontSize = this.size;
        do {
            ctx.font = fontSize + "px serif";
            fontSize-=3;
        } while (ctx.measureText(this.label).width > (this.size - PADDING) * 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.label, this.pos.x, this.pos.y);
    }

    // For normal Nodes, the connection point is only the central one 
    occupyClosestConnectionPoint(point: Vector2D, sameSegmentRequired? : boolean): Vector2D | null;
    occupyClosestConnectionPoint(segment: Segment, sameSegmentRequired? : boolean): Vector2D | null;
    occupyClosestConnectionPoint(_param: any, _sameSegmentRequired? : boolean): Vector2D | null {
        return this.pos;
    }

    findEdgeConnectionPosition(edgeSegment : Segment) : Vector2D{
        return this.occupyClosestConnectionPoint(edgeSegment)!;
    }

    // For normal Nodes, the connection point is only the central one 
    occupyConnectionPointBySegment(_segment : Segment) : Vector2D | null {
        return this.pos;
    }

    // For normal Nodes, nothing happens
    resetConnectionPoints() : void {
    }

    clone() : Node {
        const newNode = new Node(this.graph, this.label, this.pos.x, this.pos.y, this.size);
        newNode.disp = new Vector2D(this.disp.x, this.disp.y);
        return newNode;
    }

}