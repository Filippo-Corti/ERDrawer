import { Node } from "./Node";
import { Edge } from "./Edge";
import { Drawable } from "../utils/Drawable";
import { Random } from "../utils/Utils";
import { Vector2D } from "../utils/Vector2D";
import { Entity } from "../erdiagram/Entity";
import { BinaryRelationship } from "../erdiagram/BinaryRelationship";


export class Graph implements Drawable {

    nodes: Map<string, Node>;
    edges: Edge[];


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

    addEdge(label1: string, label2: string, label? : string): void {

        const n1 = this.nodes.get(label1);
        const n2 = this.nodes.get(label2);

        if (!n1 || !n2) {
            return;
        }

        const existingEdge = this.edges.find((e) => e.node1.label == label1 && e.node2.label == label2);
        if (existingEdge) {
            existingEdge.count++;
            if (label) {
                (existingEdge as BinaryRelationship).labels.push(label);
            }
        } else {
            if (label) {
                this.edges.push(new BinaryRelationship(n1, n2, 1, [label]));
            }
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

    //Deep copies the Graph
    clone(): Graph {
        const newNodes: Node[] = [];

        this.nodes.forEach((node, _) => {
            let newNode: Node;
            switch (true) {
                case node instanceof Entity:
                    newNode = new Entity(node.label, node.pos.x, node.pos.y);
                    break;
                default:
                    newNode = new Node(node.label, node.pos.x, node.pos.y);
                    break;
            }
            newNodes.push(newNode);
        });

        const newGraph = new Graph(newNodes);
        this.edges.forEach(edge => {
            switch (true) {
                case edge instanceof BinaryRelationship:
                    const edgeAsBR = edge as BinaryRelationship;
                    for (let i = 0; i < edge.count; i++)
                        newGraph.addEdge(edge.node1.label, edge.node2.label, edgeAsBR.labels[i]);
                    break;
                default:
                    for (let i = 0; i < edge.count; i++)
                        newGraph.addEdge(edge.node1.label, edge.node2.label);
                    break;
            }
        });

        return newGraph;
    }

}