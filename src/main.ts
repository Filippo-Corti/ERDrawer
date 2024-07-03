import './style.css'
import { Drawer } from './Drawer';
import { Node } from "./graph/Node";
import { Graph } from './graph/Graph.ts';
import { GraphDrawer } from './GraphDrawer.ts';



var seed = 8;
function random() : number {
    //return Math.random()
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function getRandomCoordinate(min: number, max: number) {
    return Math.floor(random() * (max - min + 1)) + min;
}



const drawer = new Drawer("drawing-board");
const MAX_WIDTH = drawer.canvas.width;
const MAX_HEIGHT = drawer.canvas.height;

let nodes: Node[] = Array();
nodes.push(new Node("A", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
nodes.push(new Node("B", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
nodes.push(new Node("C", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
nodes.push(new Node("D", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
nodes.push(new Node("E", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
nodes.push(new Node("F", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
nodes.push(new Node("G", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
nodes.push(new Node("H", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));

const graph = new Graph(nodes);

graph.addEdge("A", "B");
graph.addEdge("A", "C");
graph.addEdge("B", "C");
graph.addEdge("B", "D");
graph.addEdge("E", "D");
graph.addEdge("E", "F");
graph.addEdge("G", "E");
graph.addEdge("H", "B");
graph.addEdge("F", "B");

const graphDrawer = new GraphDrawer(drawer, graph);
graphDrawer.drawGraph();
graphDrawer.drawer.drawGrid();

const layoutBtn = document.getElementById("layout-btn")

layoutBtn?.addEventListener("click", () => {
    graphDrawer.executeFructhermanReingold(1000);
    //graphDrawer.discretizeNodesCoordinates();
    graphDrawer.drawGraph();
    graphDrawer.drawer.drawGrid();
});


const discretizeBtn = document.getElementById("discretize-btn")

discretizeBtn?.addEventListener("click", () => {
    graphDrawer.discretizeNodesCoordinates();
    graphDrawer.drawGraph();
    graphDrawer.drawer.drawGrid();
});