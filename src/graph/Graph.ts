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

    getNodeWithMostEdges() : Node {
        const edgeCounts = new Map<string, number>();

        // Count edges for each node
        this.edges.forEach(edge => {
            const { node1, node2 } = edge;

            if (!edgeCounts.has(node1.label)) {
                edgeCounts.set(node1.label, 0);
            }
            if (!edgeCounts.has(node2.label)) {
                edgeCounts.set(node2.label, 0);
            }

            edgeCounts.set(node1.label, edgeCounts.get(node1.label)! + 1);
            edgeCounts.set(node2.label, edgeCounts.get(node2.label)! + 1);
        });

        // Find the node with the most edges
        let maxEdges = -1;
        let maxNode: Node | null = null;

        edgeCounts.forEach((count, label) => {
            if (count > maxEdges) {
                maxEdges = count;
                maxNode = this.nodes.get(label) || null;
            }
        });

        if (maxNode === null) {
            throw new Error("No nodes with edges found");
        }

        return maxNode;
    }

}