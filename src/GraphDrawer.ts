import { Drawer } from "./Drawer";
import { Vector2D } from "./utils/Vector2D";
import { Graph } from "./graph/Graph";
import { Node } from "./graph/Node";

export class GraphDrawer {

    drawer: Drawer
    graph: Graph

    static DELTA: number = 200;

    constructor(drawer: Drawer, graph: Graph) {
        this.drawer = drawer;
        this.graph = graph;
    }

    //Draws Graph on the Drawer canvas
    drawGraph() {
        this.graph.nodes.forEach(v => {
            v.size = this.calcNodeSize();
        });
        this.drawer.clear();
        this.graph.draw(this.drawer.ctx);
        //this.drawer.drawGrid(GraphDrawer.DELTA);
    }

    /* Positions the Nodes in the Graph in a way that:
        - Looks harmonious (using Fruchterman-Reingold)
        - Looks geometrically organized (positions are discretized)
        - Avoids crossings (it finds the best disposition out of N tries) 
    */
    positionElegantly(): void {
        const MAX_WIDTH = this.drawer.width;
        const MAX_HEIGHT = this.drawer.height;
        const BORDER = 50;
        const N = 1000;
        let minCrossings = 100;
        let minGraph = this.graph.clone();

        for (let i = 0; i < N; i++) {
            // Generate New Random Graph 
            this.graph.randomizePositions(BORDER, MAX_WIDTH - BORDER, BORDER, MAX_HEIGHT - BORDER);

            // Apply the Layout Algorithm
            this.executeFructhermanReingold(200, BORDER, true);
            this.discretizeNodesCoordinates(BORDER);

            // Check if current layout is better than the best one so far
            let crossings = this.countCrossings();
            if (crossings < minCrossings) {
                minCrossings = crossings;
                minGraph = this.graph.clone();
            }
        }

        this.graph = minGraph.clone();
        console.log("Found best solution with crossings:", minCrossings);
    }

    //Base code comes from https://faculty.washington.edu/joelross/courses/archive/s13/cs261/lab/k/fruchterman91graph.pdf
    //Positions Nodes using the Fruchterman-Reingold Algorithm.
    //The node with the most amount of edges is positioned in the center if centerMainNode is set to true
    executeFructhermanReingold(n: number, borderSize: number, centerMainNode: boolean = false): void {
        const width = this.drawer.canvas.width;
        const height = this.drawer.canvas.height;
        const area = width * height;
        const k = Math.sqrt(area / this.graph.nodes.size)
        let t = 5.0;

        const f_a = (x: number) => x * x / k;
        const f_r = (x: number) => k * k / x;

        const centralNode = this.graph.getNodeWithMostEdges();
        //Calc Node Sizes so that Boundaries are correct
        this.graph.nodes.forEach(v => {
            v.size = this.calcNodeSize();
        });

        for (let i = 0; i < n; i++) {
            //Calculate Repulsive Forces
            for (const [_, v] of this.graph.nodes) {
                v.disp = new Vector2D(0, 0);
                for (const [_, u] of this.graph.nodes) {
                    if (v == u) continue;

                    const gamma: Vector2D = new Vector2D(v.pos.x - u.pos.x, v.pos.y - u.pos.y);
                    const gammaAbs: number = gamma.magnitude();
                    const fr: number = f_r(gammaAbs);
                    v.disp.sum(new Vector2D(gamma.x / gammaAbs * fr, gamma.y / gammaAbs * fr));
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

            // Eventually attract main node to center
            if (centerMainNode) {
                const gamma: Vector2D = new Vector2D(centralNode.pos.x - width / 2, centralNode.pos.y - height / 2);
                const gammaAbs: number = gamma.magnitude();
                const fa: number = f_a(gammaAbs) * 100;
                const vect = new Vector2D(gamma.x / gammaAbs * fa, gamma.y / gammaAbs * fa);
                if (!Number.isNaN(vect.x) && !Number.isNaN(vect.y)) {
                    centralNode.disp.sum(vect.negative());
                }
            }

            //Limit max displacement to temperature t and prevent from displacement outside frame
            for (const [_, v] of this.graph.nodes) {
                const a = Math.min(v.disp.magnitude(), t);
                const vect = new Vector2D(v.disp.x / v.disp.magnitude() * a, v.disp.y / v.disp.magnitude() * a);
                if (!Number.isNaN(vect.x) && !Number.isNaN(vect.y)) {
                    v.pos.sum(vect);
                }
                v.pos = this.getCoordsWithBoundaries(v.pos, borderSize);
            }
        }

    }

    //Positions Nodes in a discretized grid.
    //If two Nodes would occupy the same spot, the discretization doesn't happen
    discretizeNodesCoordinates(borderSize: number): void {
        const rows = Math.floor(this.drawer.height / GraphDrawer.DELTA + 1);
        const cols = Math.floor(this.drawer.width / GraphDrawer.DELTA + 1);
        var nodesPerSquare: Node[][] = Array.from({ length: rows * cols }, () => []);
        for (const [_, v] of this.graph.nodes) {
            const discrCoords = this.getDiscretizedCoords(v.pos, borderSize);
            const nodeCol = Math.round(discrCoords.x / GraphDrawer.DELTA);
            const nodeRow = Math.round(discrCoords.y / GraphDrawer.DELTA);
            nodesPerSquare[nodeRow * cols + nodeCol].push(v);
        }

        //Discretize only if 1 per square
        nodesPerSquare.filter((a) => a.length <= 1).forEach((a) => {
            a.forEach((node) => node.pos = this.getDiscretizedCoords(node.pos, borderSize));
        })

    }

    //Returns the discrete coordinates of v, within the boundaries of the drawing canvas
    getDiscretizedCoords(v: Vector2D, borderSize: number): Vector2D {
        return this.getCoordsWithBoundaries(new Vector2D(Math.round(v.x / GraphDrawer.DELTA) * GraphDrawer.DELTA, Math.round(v.y / GraphDrawer.DELTA) * GraphDrawer.DELTA), borderSize);
    }

    //Returns coordinates of v making sure that they are within at least borderSize px from the border of the canvas
    getCoordsWithBoundaries(v: Vector2D, borderSize: number): Vector2D {
        return new Vector2D(Math.min(this.drawer.width - borderSize, Math.max(0 + borderSize, v.x)), Math.min(this.drawer.height - borderSize, Math.max(0 + borderSize, v.y)));
    }

    //Calculate Radius of a Node based on the size of the canvas and the number of nodes
    calcNodeSize(): number {
        const minDim = Math.min(this.drawer.width, this.drawer.height);
        const nodesCount = this.graph.nodes.size;
        return Math.min(50, minDim / (2 * nodesCount));
    }

    //Returns the number of edge pairs that intersect in the current graph disposition
    countCrossings(): number {
        let count: number = 0;
        for (let i = 0; i < this.graph.edges.length; i++) {
            const e = this.graph.edges[i];
            const s1 = e.getDrawingSegment();

            for (let j = i + 1; j < this.graph.edges.length; j++) {
                const f = this.graph.edges[j];
                const s2 = f.getDrawingSegment();

                if (s1.intersects(s2)) {
                    if (s1.parallel(s2)) {
                        count += 999; // This is a crossing we really want to avoid
                    } else {
                        count += 1;
                    }
                }

            }
        }
        return count;
    }



}