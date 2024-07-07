import { Drawer } from "./Drawer";
import { Vector2D } from "./Vector2D";
import { Graph } from "./graph/Graph";
import { Node } from "./graph/Node";

export class GraphDrawer {

    drawer: Drawer
    graph: Graph

    static DELTA : number = 200;

    constructor(drawer: Drawer, graph: Graph) {
        this.drawer = drawer;
        this.graph = graph;
    }

    drawGraph() {
        this.graph.nodes.forEach(v => {
            v.size = this.calcNodeSize();
        });
        this.drawer.clear();
        this.graph.draw(this.drawer.ctx);
    }

    executeFructhermanReingold(n: number): void {
        const width = this.drawer.canvas.width;
        const height = this.drawer.canvas.height;
        const area = width * height;
        const k = Math.sqrt(area / this.graph.nodes.size)
        let t = 5.0;

        const f_a = (x: number) => x * x / k;
        const f_r = (x: number) => k * k / x;

        const centralNode = this.graph.getNodeWithMostEdges();

        for (let i = 0; i < n; i++) {
            //Calculate Repulsive Forces
            for (const [_, v] of this.graph.nodes) {
                v.disp = new Vector2D(0, 0);
                for (const [_, u] of this.graph.nodes) {
                    if (v != u) {
                        const gamma: Vector2D = new Vector2D(v.pos.x - u.pos.x, v.pos.y - u.pos.y);
                        const gammaAbs: number = gamma.magnitude();
                        const fr: number = f_r(gammaAbs);
                        v.disp.sum(new Vector2D(gamma.x / gammaAbs * fr, gamma.y / gammaAbs * fr));
                    }
                }
            }
            //Calculate Attractive Forces
            for (const e of this.graph.edges) {
                const gamma: Vector2D = new Vector2D(e.node1.pos.x - e.node2.pos.x, e.node1.pos.y - e.node2.pos.y);
                const gammaAbs: number = gamma.magnitude();
                const fa: number = f_a(gammaAbs);
                const vect = new Vector2D(gamma.x / gammaAbs * fa, gamma.y / gammaAbs * fa);
                e.node1.disp.sum(vect.negative());
                e.node2.disp.sum(vect);
            }

            //Attract main node to center
            const gamma: Vector2D = new Vector2D(centralNode.pos.x - width/2, centralNode.pos.y - height/2);
            const gammaAbs: number = gamma.magnitude();
            const fa: number = f_a(gammaAbs) * 100;
            const vect = new Vector2D(gamma.x / gammaAbs * fa, gamma.y / gammaAbs * fa);
            if (!Number.isNaN(vect.x) && !Number.isNaN(vect.y)) {
                centralNode.disp.sum(vect.negative());
            } else {
                console.log("Ciao");
            }

            //Limit max displacement to temperature t and prevent from displacement outside frame
            for (const [_, v] of this.graph.nodes) {
                const a = Math.min(v.disp.magnitude(), t);
                const vect = new Vector2D(v.disp.x / v.disp.magnitude() * a, v.disp.y / v.disp.magnitude() * a);
                if (!Number.isNaN(vect.x) && !Number.isNaN(vect.y)) {                
                    v.pos.sum(vect);
                }
                v.pos = this.getCoordsWithBoundaries(v.pos, v.size);
                //t = Math.max(1.0, t - 0.25);
            }
        }

    }

    discretizeNodesCoordinates(): void {
        const rows = Math.floor(this.drawer.height / GraphDrawer.DELTA + 1);
        const cols = Math.floor(this.drawer.width / GraphDrawer.DELTA + 1);
        var nodesPerSquare : Node[][] = Array.from({ length: rows * cols }, () => []);
        for (const [_, v] of this.graph.nodes) {
            const discrCoords = this.getDiscretizedCoords(v.pos, v.size);
            const nodeCol = Math.round(discrCoords.x / GraphDrawer.DELTA);
            const nodeRow = Math.round(discrCoords.y / GraphDrawer.DELTA);
            nodesPerSquare[nodeRow * cols + nodeCol].push(v);
        }

        //Discretize only if 1 per square
        nodesPerSquare.filter((a) => a.length <= 1).forEach((a) => {
            a.forEach((node) => node.pos = this.getDiscretizedCoords(node.pos, node.size));
        })

    }

    getDiscretizedCoords(v: Vector2D, borderSize : number): Vector2D {
        return this.getCoordsWithBoundaries(new Vector2D(Math.round(v.x / GraphDrawer.DELTA) * GraphDrawer.DELTA, Math.round(v.y / GraphDrawer.DELTA) * GraphDrawer.DELTA), borderSize);
    }

    getCoordsWithBoundaries(v: Vector2D, borderSize : number): Vector2D {
        return new Vector2D(Math.min(this.drawer.width - borderSize, Math.max(0 + borderSize, v.x)), Math.min(this.drawer.height - borderSize, Math.max(0 + borderSize, v.y)));
    }

    //Calculate Radius of a Node based on the size of the canvas and the number of nodes
    calcNodeSize() : number {
        const minDim = Math.min(this.drawer.width, this.drawer.height);
        const nodesCount = this.graph.nodes.size;
        return Math.min(50, minDim / (2 * nodesCount));
    }



}