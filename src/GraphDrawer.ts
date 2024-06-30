import { Drawer } from "./Drawer";
import { Graph } from "./graph/Graph";

export class GraphDrawer {

    drawer : Drawer
    graph : Graph
    
    constructor(drawer : Drawer, graph : Graph) {
        this.drawer = drawer;
        this.graph = graph;
    }

    drawGraph() {
        this.graph.draw(this.drawer.ctx);
    }



}