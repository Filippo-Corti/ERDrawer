import { Graph } from "./Graph";
import { Node } from "./Node";
import { Vector2D } from "../utils/Vector2D";
import * as fs from 'fs';

export class GraphSerializer {

    static exportGraph(graph : Graph) : string {
        const serializedGraph = {
            nodes: Array.from(graph.nodes.values()).map(node => ({
                label: node.label,
                pos: { x: node.pos.x, y: node.pos.y },
                disp: { x: node.disp.x, y: node.disp.y },
                size: node.size
            })),
            edges: graph.edges.map(edge => ({
                node1: edge.node1.label,
                node2: edge.node2.label,
                count: edge.count
            }))
        };

        return JSON.stringify(serializedGraph, null, 2);
    }

    static importGraph(json : string) : Graph {
        const parsedData = JSON.parse(json);

        const nodes : Node[] = [];
        parsedData.nodes.forEach((nodeData: any) => {
            const node = new Node(nodeData.label, nodeData.pos.x, nodeData.pos.y, nodeData.size);
            node.disp = new Vector2D(nodeData.disp.x, nodeData.disp.y);
            nodes.push(node);
        });

        const graph = new Graph(nodes);

        parsedData.edges.forEach((edgeData: any) => {
            const node1 = graph.nodes.get(edgeData.node1);
            const node2 =  graph.nodes.get(edgeData.node2);
            if (node1 && node2) {
                graph.addEdge(node1.label, node2.label);
            }
        });

        return graph;
    }

    // Just for developement 
    static async importGraphFromFile(fileName : string) : Promise<Graph> {
        let graph : Graph = new Graph();
        await fetch(fileName)
        .then(response => response.text())
        .then(data => {
            graph = GraphSerializer.importGraph(data);
            console.log('Loaded Graph from sales.json:', graph);
            // You can now use the loaded graph in your application
        })
        .catch(error => console.error('Error loading graph:', error));
        return graph;
    }


}