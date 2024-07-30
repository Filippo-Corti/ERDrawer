import { Node } from "../graph/Node";
import { Graph } from "../graph/Graph";
import { BinaryRelationship } from "./BinaryRelationship";
import { Edge } from "../graph/Edge";



export class ERDiagram extends Graph {

    addBinaryRelationship(label1: string, label2: string, edgeLabel: string) {
        const n1 = this.nodes.get(label1);
        const n2 = this.nodes.get(label2);

        if (!n1 || !n2) {
            return;
        }

        const existingEdge = this.edges.find((e) => e.node1.label == label1 && e.node2.label == label2);

        if (existingEdge) {
            existingEdge.count++;
            (existingEdge as BinaryRelationship).labels.push(edgeLabel);
        } else {
            this.edges.push(new BinaryRelationship(n1, n2, 1, [edgeLabel]));
        }
    }

    //Deep copies the ER Diagram
    clone(): ERDiagram {
        const newNodes: Map<string, Node> = new Map<string, Node>;
        const newEdges: Edge[] = [];


        this.nodes.forEach((node, _) => {
            newNodes.set(node.label, node.clone());
        });

        const erDiagram = new ERDiagram(Array.from(newNodes.values()));
        this.edges.forEach(edge => {
            let node1 = newNodes.get(edge.node1.label);
            let node2 = newNodes.get(edge.node2.label);
            if (!node1 || !node2) return;

            const edgeClone = edge.clone();
            edgeClone.node1 = node1;
            edgeClone.node2 = node2;
            newEdges.push(edgeClone);
        });

        erDiagram.edges = newEdges;

        return erDiagram;
    }
}