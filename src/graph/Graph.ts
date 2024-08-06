import { Node } from "./Node";
import { Edge } from "./Edge";
import { Drawable } from "../utils/Drawable";
import { Random } from "../utils/Utils";
import { Vector2D } from "../utils/Vector2D";

export class Graph implements Drawable {

    nodes: Map<string, Node>;
    edges: Edge[];

    static OFFSET_BETWEEN_MULTIEDGES: number = 100; //In the center

    constructor(nodes: Node[] = []) {
        this.nodes = new Map<string, Node>;
        nodes.forEach(node => {
            this.nodes.set(node.label, node);
        });
        this.edges = Array();
    }

    addNode(node: Node): void {
        this.nodes.set(node.label, node);
    }

    addEdge(label1: string, label2: string): void {
        const n1 = this.nodes.get(label1);
        const n2 = this.nodes.get(label2);

        if (!n1 || !n2) {
            return;
        }
        this.edges.push(new Edge(n1, n2));

        const existingEdges = this.edges.filter((e) => e.node1.label == label1 && e.node2.label == label2);

        //Update edge's middlePoints
        const middle = new Vector2D(
            (existingEdges[0].vertex1.x + existingEdges[0].vertex2.x) / 2,
            (existingEdges[0].vertex1.y + existingEdges[0].vertex2.y) / 2
        );
        const theta = new Vector2D(
            existingEdges[0].vertex2.y - existingEdges[0].vertex1.y, 
            existingEdges[0].vertex2.x - existingEdges[0].vertex1.x).phase();
        for (let i = 0; i < existingEdges.length; i++) {
            const offsetFactor = (i - (existingEdges.length - 1) / 2);
            console.log(offsetFactor);
            const dx = Graph.OFFSET_BETWEEN_MULTIEDGES * offsetFactor * Math.sin(theta);
            const dy = Graph.OFFSET_BETWEEN_MULTIEDGES * offsetFactor * -Math.cos(theta);
            existingEdges[i].middlePoint = Vector2D.sum(middle, new Vector2D(dx, dy));
        }

    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.edges.forEach(edge => edge.draw(ctx));
        this.nodes.forEach(node => node.draw(ctx));
    }

    getNodeWithMostEdges(): Node {
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

    //Assigns random positions to the nodes
    randomizePositions(minX: number, maxX: number, minY: number, maxY: number): void {
        this.nodes.forEach((node) => {
            node.pos.x = Random.getRandom(minX, maxX);
            node.pos.y = Random.getRandom(minY, maxY);
            node.disp = new Vector2D(0, 0);
        });
    }

    getEdgesByNode(label: string): Edge[] {
        const connectingEdges: Edge[] = [];
        this.edges.forEach((e) => {
            if (e.node1.label == label || e.node2.label == label) {
                connectingEdges.push(e);
            }
        });
        return connectingEdges;
    }

    //Deep copies the Graph
    clone(): Graph {
        const newNodes: Node[] = [];

        this.nodes.forEach((node, _) => {
            let newNode: Node;
            newNode = new Node(node.label, node.pos.x, node.pos.y);
            newNodes.push(newNode);
        });

        const newGraph = new Graph(newNodes);
        this.edges.forEach(edge => {
            newGraph.addEdge(edge.node1.label, edge.node2.label);
        });

        return newGraph;
    }

}