import { Node } from "./Node";
import { Edge } from "./Edge";
import { Drawable } from "../Drawable";


export class Graph implements Drawable {

    nodes: Map<string, Node>;
    edges: Edge[];

    constructor(nodes: Node[]) {
        this.nodes = new Map<string, Node>;
        nodes.forEach(node => {
            this.nodes.set(node.label, node);
        });
        this.edges = Array();
    }

    addEdge(label1: string, label2: string): void {

        const n1 = this.nodes.get(label1);
        const n2 = this.nodes.get(label2);

        if (!n1 || !n2) {
            throw new Error("Invalid labels");
        }

        this.edges.push(new Edge(n1, n2));
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.edges.forEach(edge => edge.draw(ctx));
        this.nodes.forEach(node => node.draw(ctx));
    }

}