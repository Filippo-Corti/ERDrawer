import './style.css'
import {Drawer} from './Drawer';
import { Node } from "./graph/Node";
import { Graph } from './graph/Graph.ts';
import { GraphDrawer } from './GraphDrawer.ts';


const drawer = new Drawer("drawing-board");


let nodes = Array();
nodes.push(new Node("A", 70, 60));
nodes.push(new Node("B", 250, 60));
nodes.push(new Node("C", 160, 240));
nodes.push(new Node("D", 400, 200));

const graph = new Graph(nodes);

graph.addEdge("A", "B");
graph.addEdge("A", "C");
graph.addEdge("B", "C");
graph.addEdge("B", "D");

const graphDrawer = new GraphDrawer(drawer, graph);
graphDrawer.drawGraph();
