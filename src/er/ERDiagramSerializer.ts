import { Node } from "../graph/Node";
import Vector2D from "../utils/Vector2D";
import ERDiagram from "./ERDiagram";

export class ERDiagramSerializer {

    static exportDiagram(er : ERDiagram) : string {
        const serializedGraph = {
        };

        return JSON.stringify(serializedGraph, null, 2);
    }

    static importDiagram(json: string): ERDiagram {
        const parsedData = JSON.parse(json);

        const erDiagram = new ERDiagram();
        parsedData.nodes.forEach((nodeData: any) => {
            let node: Node;
            switch (nodeData.type) {
                case "Node":
                    node = new Node(erDiagram, nodeData.label, nodeData.pos.x, nodeData.pos.y, nodeData.size);
                    break;
                case "Entity":
                    node = new Entity(erDiagram, nodeData.label, nodeData.pos.x, nodeData.pos.y, nodeData.size, []);
                    for (const attr of nodeData.attributes) {
                        (node as Entity).addAttribute(attr.label, attr.id);
                    }
                    break;
            }
            node!.disp = new Vector2D(nodeData.disp.x, nodeData.disp.y);
            erDiagram.addNode(node!);
        });


        parsedData.edges.forEach((edgeData: any) => {
            const node1 = erDiagram.nodes.get(edgeData.node1);
            const node2 = erDiagram.nodes.get(edgeData.node2);
            if (node1 && node2) {
                switch (edgeData.type) {
                    case "BinaryRelationship":
                        erDiagram.addBinaryRelationship(node1.label, node2.label, edgeData.label, edgeData.card1, edgeData.card2);
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