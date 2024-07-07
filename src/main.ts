import './style.css'
import { Drawer } from './Drawer';
import { Node } from "./graph/Node";
import { Graph } from './graph/Graph.ts';
import { GraphDrawer } from './GraphDrawer.ts';

var seed = 8;
function random() : number {
    return Math.random()
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function getRandomCoordinate(min: number, max: number) {
    return Math.floor(random() * (max - min + 1)) + min;
}

function randomGraph() : Graph {
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

    return graph;
}

function libreriaGraph() : Graph {
    let nodes: Node[] = Array();
    nodes.push(new Node("Libro", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Copia", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Prestito", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Lettore", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    
    const graph = new Graph(nodes);
    
    graph.addEdge("Libro", "Copia");
    graph.addEdge("Copia", "Prestito");
    graph.addEdge("Prestito", "Lettore");

    return graph;
}

function calcioGraph() : Graph {
    let nodes: Node[] = Array();
    nodes.push(new Node("Giornata", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Partita", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Arbitro", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Squadra", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Giocatore", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    
    const graph = new Graph(nodes);
    
    graph.addEdge("Giornata", "Partita");
    graph.addEdge("Partita", "Arbitro");
    graph.addEdge("Partita", "Squadra");
    graph.addEdge("Squadra", "Giocatore");
    graph.addEdge("Partita", "Giocatore");

    return graph;
}

function residentiGraph() : Graph {
    let nodes: Node[] = Array();
    nodes.push(new Node("Cittadino", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Residente", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Famiglia", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    
    const graph = new Graph(nodes);
    
    graph.addEdge("Cittadino", "Residente");
    graph.addEdge("Residente", "Famiglia");
    graph.addEdge("Residente", "Famiglia");
    return graph;
}

function ecommerceGraph(): Graph {
    let nodes: Node[] = Array();
    nodes.push(new Node("User", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Product", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Order", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Payment", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Review", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Category", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));
    nodes.push(new Node("Cart", getRandomCoordinate(50, MAX_WIDTH - 50), getRandomCoordinate(50, MAX_HEIGHT - 50)));

    const graph = new Graph(nodes);

    graph.addEdge("User", "Order");
    graph.addEdge("User", "Review");
    graph.addEdge("User", "Cart");
    graph.addEdge("Order", "Product");
    graph.addEdge("Order", "Payment");
    graph.addEdge("Product", "Category");
    graph.addEdge("Cart", "Product");
    graph.addEdge("Review", "Product");
    graph.addEdge("Review", "Product");

    return graph;
}


const drawer = new Drawer("drawing-board");
const MAX_WIDTH = drawer.canvas.width;
const MAX_HEIGHT = drawer.canvas.height;

//const graph = randomGraph();
//const graph = libreriaGraph();
//const graph = calcioGraph();
//const graph = residentiGraph();
const graph = ecommerceGraph();
const graphDrawer = new GraphDrawer(drawer, graph);
graphDrawer.drawGraph();
graphDrawer.drawer.drawGrid(GraphDrawer.DELTA);


const layoutBtn = document.getElementById("layout-btn")

layoutBtn?.addEventListener("click", () => {
    graphDrawer.executeFructhermanReingold(1000);
    graphDrawer.drawGraph();
    graphDrawer.drawer.drawGrid(GraphDrawer.DELTA);
});


const discretizeBtn = document.getElementById("discretize-btn")

discretizeBtn?.addEventListener("click", () => {
    graphDrawer.discretizeNodesCoordinates();
    graphDrawer.executeFructhermanReingold(1000); //Fixes eventually overlapping edges
    graphDrawer.discretizeNodesCoordinates();
    graphDrawer.drawGraph();
    graphDrawer.drawer.drawGrid(GraphDrawer.DELTA);
});