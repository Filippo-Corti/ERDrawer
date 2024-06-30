import { Drawer } from "./Drawer";
import { Vector2D } from "./Vector2D";
import { Graph } from "./graph/Graph";
import { Node } from "./graph/Node";

export class GraphDrawer {

    drawer: Drawer
    graph: Graph

    constructor(drawer: Drawer, graph: Graph) {
        this.drawer = drawer;
        this.graph = graph;
    }

    drawGraph() {
        this.drawer.clear();
        this.graph.draw(this.drawer.ctx);
    }

    executeFructhermanReingold(n: number): void {
        const width = this.drawer.canvas.width;
        const height = this.drawer.canvas.height;
        const area = width * height;
        const k = Math.sqrt(area / this.graph.nodes.size)
        let t = 5.0;

        const f_a = (x : number) => x * x / k;
        const f_r = (x : number) => k * k / x;

        for (let i = 0; i < n; i++) {
            //Calculate Repulisve Forces
            for (const [_, v] of this.graph.nodes) {
                v.disp = new Vector2D(0, 0);
                for (const [_, u] of this.graph.nodes) {
                    if (v != u) {
                        const gamma : Vector2D = new Vector2D(v.pos.x - u.pos.x, v.pos.y - u.pos.y);
                        const gammaAbs : number = gamma.magnitude();
                        const fr : number = f_r(gammaAbs);
                        v.disp.sum(new Vector2D(gamma.x/gammaAbs * fr, gamma.y/gammaAbs * fr));
                    }
                }
            }
            //Calculate Attractive Forces
            for (const e of this.graph.edges) {
                const gamma : Vector2D = new Vector2D(e.node1.pos.x - e.node2.pos.x, e.node1.pos.y - e.node2.pos.y);
                const gammaAbs : number = gamma.magnitude();
                const fa : number = f_a(gammaAbs);
                const vect = new Vector2D(gamma.x/gammaAbs * fa, gamma.y/gammaAbs * fa);
                e.node1.disp.sum(vect.negative());
                e.node2.disp.sum(vect);
            }
            //Limit max displacement to temperature t and prevent from displacement outside frame
            for (const [_, v] of this.graph.nodes) {
                const a = Math.min(v.disp.magnitude(), t);
                const vect = new Vector2D(v.disp.x / v.disp.magnitude() * a, v.disp.y / v.disp.magnitude() * a);
                v.pos.sum(vect);
                v.pos.x = Math.min(width - Node.DRAWING_RADIUS, Math.max(0 + Node.DRAWING_RADIUS, v.pos.x));
                v.pos.y = Math.min(height - Node.DRAWING_RADIUS, Math.max(0 + Node.DRAWING_RADIUS, v.pos.y));
                //t = Math.max(1.0, t - 0.25);
            }
        }
    }




}