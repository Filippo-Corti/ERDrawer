import { Node } from "../graph/Node";
import { Vector2D } from "../utils/Vector2D";
import { Entity } from "./Entity";
import { Edge } from "../graph/Edge";
import { ERDiagram } from "./ERDiagram";

export class ERDiagramSerializer {

    // static exportGraph(graph : Graph) : string {
    //     const serializedGraph = {
    //         nodes: Array.from(graph.nodes.values()).map(node => ({
    //             label: node.label,
    //             pos: { x: node.pos.x, y: node.pos.y },
    //             disp: { x: node.disp.x, y: node.disp.y },
    //             size: node.size
    //         })),
    //         edges: graph.edges.map(edge => ({
    //             node1: edge.node1.label,
    //             node2: edge.node2.label,
    //             count: edge.count
    //         }))
    //     };

    //     return JSON.stringify(serializedGraph, null, 2);
    // }

    static importDiagram(json: string): ERDiagram {
        const parsedData = JSON.parse(json);

        const nodes: Node[] = [];
        parsedData.nodes.forEach((nodeData: any) => {
            let node: Node;
            switch (nodeData.type) {
                case "Node":
                    node = new Node(nodeData.label, nodeData.pos.x, nodeData.pos.y, nodeData.size);
                    break;
                case "Entity":
                    node = new Entity(nodeData.label, nodeData.pos.x, nodeData.pos.y, nodeData.size, []);
                    for (const attr of nodeData.attributes) {
                        (node as Entity).addAttribute(attr.label, attr.id);
                    }
                    break;
            }
            node!.disp = new Vector2D(nodeData.disp.x, nodeData.disp.y);
            nodes.push(node!);
        });

        const erDiagram = new ERDiagram(nodes);

        parsedData.edges.forEach((edgeData: any) => {
            const node1 = erDiagram.nodes.get(edgeData.node1);
            const node2 = erDiagram.nodes.get(edgeData.node2);
            if (node1 && node2) {
                switch (edgeData.type) {
                    case "BinaryRelationship":
                        erDiagram.addBinaryRelationship(node1.label, node2.label, edgeData.label);
                        break;
                    case "Edge":
                        erDiagram.addEdge(node1.label, node2.label);
                        break;
                }
            }
        });

        return erDiagram;
    }

    // Just for developement 
    static async importGraphFromLocalFile(fileName: string): Promise<ERDiagram> {
        let graph: ERDiagram = new ERDiagram();
        await fetch(fileName)
            .then(response => response.text())
            .then(data => {
                graph = ERDiagramSerializer.importDiagram(data);
                console.log('Loaded ER Diagram from ' + fileName + ': ', graph);
            })
            .catch(error => console.error('Error loading ER Diagram:', error));
        return graph;
    }


}