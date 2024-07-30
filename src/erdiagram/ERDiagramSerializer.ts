import { Graph } from "../graph/Graph";
import { Node } from "../graph/Node";
import { Vector2D } from "../utils/Vector2D";
import { Entity } from "./Entity";

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

    static importDiagram(json: string): Graph {
        const parsedData = JSON.parse(json);

        const nodes: Node[] = [];
        parsedData.nodes.forEach((nodeData: any) => {
            const node = new Entity(nodeData.label, nodeData.pos.x, nodeData.pos.y, nodeData.size);
            node.disp = new Vector2D(nodeData.disp.x, nodeData.disp.y);
            nodes.push(node);
        });

        const graph = new Graph(nodes);

        parsedData.edges.forEach((edgeData: any) => {
            const node1 = graph.nodes.get(edgeData.node1);
            const node2 = graph.nodes.get(edgeData.node2);
            if (node1 && node2) {
                for (let i = 0; i < edgeData.count; i++)
                    graph.addEdge(node1.label, node2.label, edgeData.labels[i]);
            }
        });

        return graph;
    }

    // Just for developement 
    static async importGraphFromFile(fileName: string): Promise<Graph> {
        let graph: Graph = new Graph();
        await fetch(fileName)
            .then(response => response.text())
            .then(data => {
                graph = ERDiagramSerializer.importDiagram(data);
                console.log('Loaded Graph from ' + fileName + ': ', graph);
            })
            .catch(error => console.error('Error loading graph:', error));
        return graph;
    }


}