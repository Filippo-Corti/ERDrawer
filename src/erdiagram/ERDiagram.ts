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

        this.edges.push(new BinaryRelationship(n1, n2, edgeLabel));


        //Update edge's middlePoints
        this.setEdgesMiddlePoints(label1, label2);
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