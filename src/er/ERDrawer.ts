import Drawer from "../Drawer";
import { Random } from "../utils/Utils";
import Vector2D from "../utils/Vector2D";
import Entity from "./Entity";
import ERDiagram, { RelationshipConnectionInfo } from "./ERDiagram";
import Relationship from "./Relationship";
import Shape from "./Shape";

type ERNode = {
    reference: Shape, // Multi-Relationship or Entity
    disp: Vector2D,
    pos: Vector2D
}

type EREdge = {
    reference: Relationship, // Binary Relationship
    erNode1: ERNode,
    erNode2: ERNode
}

export default class ERDrawer {

    static ER_MARGIN: number = 200;
    static DELTA = 200;

    er: ERDiagram;
    drawer: Drawer;

    constructor(er: ERDiagram, drawer: Drawer) {
        this.er = er;
        this.drawer = drawer;
    }

    drawER() {
        this.drawer.clear();
        this.er.draw(this.drawer.ctx);
    }

    layout() {
        const [nodes, edges] = this.ERtoRandomGraph();
        this.executeFructhermanReingold(nodes, edges, 100);
        this.graphToER(nodes, edges);
    }

    // /* Positions the Nodes in the Graph in a way that:
    //     - Looks harmonious (using Fruchterman-Reingold)
    //     - Looks geometrically organized (positions are discretized)
    //     - Avoids crossings (it finds the best disposition out of N tries) 
    //     - Avoids edges passing across nodes
    // */
    // layoutGraph(numberOfGraphs: number, iterationsPerGraph: number): void {
    //     let minCrossings = 100;
    //     let minGraph = this.graph.clone();

    //     for (let i = 0; i < numberOfGraphs; i++) {
    //         // Generate New Random Graph 
    //         const [nodes, edges] = this.ERtoRandomGraph();

    //         // Apply the Layout Algorithm
    //         this.executeFructhermanReingold(iterationsPerGraph, BORDER, true);
    //         this.discretizeNodesCoordinates(BORDER);

    //         // Reset Nodes connection points
    //         this.graph.nodes.forEach((n) => n.resetConnectionPoints());
    //         // Calculate Edges positions (based on new nodes positions!)
    //         try {
    //             this.graph.layoutEdges();
    //         } catch (error) {
    //             continue; // If you can't calculate new vertices, it's not a good layout
    //         }

    //         // Check if current layout is better than the best one so far (the new edge positions are used!)
    //         let crossings = this.countCrossings();
    //         if (crossings < minCrossings && !this.doesAnyEdgeCrossANode()) {
    //             minCrossings = crossings;
    //             minGraph = this.graph.clone();
    //         }
    //     }

    //     this.graph = minGraph.clone();
    //     console.log("Found best solution with", minCrossings, "crossings");
    //     console.log(this.graph);
    // }

    //Base code comes from https://faculty.washington.edu/joelross/courses/archive/s13/cs261/lab/k/fruchterman91graph.pdf
    //Positions Nodes using the Fruchterman-Reingold Algorithm.
    executeFructhermanReingold(nodes: ERNode[], edges: EREdge[], n: number): void {
        const width = this.drawer.canvas.width;
        const height = this.drawer.canvas.height;
        const area = width * height;
        const k = Math.sqrt(area / nodes.length)
        let t = 5.0;

        const f_a = (x: number) => x * x / k;
        const f_r = (x: number) => k * k / x;

        for (let i = 0; i < n; i++) {
            //Calculate Repulsive Forces
            for (const v of nodes) {
                v.disp = new Vector2D(0, 0);
                for (const u of nodes) {
                    if (v == u) continue;

                    const gamma: Vector2D = Vector2D.sum(v.pos, u.pos.negative());
                    const gammaAbs: number = gamma.magnitude();
                    const fr: number = f_r(gammaAbs);
                    v.disp.sum(new Vector2D(gamma.x / gammaAbs * fr, gamma.y / gammaAbs * fr));
                }
            }

            //Calculate Attractive Forces
            for (const e of edges) {
                const gamma: Vector2D = Vector2D.sum(e.erNode1.pos, e.erNode2.pos.negative());
                const gammaAbs: number = gamma.magnitude();
                const fa: number = f_a(gammaAbs);
                const vect = new Vector2D(gamma.x / gammaAbs * fa, gamma.y / gammaAbs * fa);
                e.erNode1.disp.sum(vect.negative());
                e.erNode2.disp.sum(vect);
            }

            //Limit max displacement to temperature t and prevent from displacement outside frame
            for (const v of nodes) {
                const a = Math.min(v.disp.magnitude(), t);
                const vect = new Vector2D(v.disp.x / v.disp.magnitude() * a, v.disp.y / v.disp.magnitude() * a);
                if (!Number.isNaN(vect.x) && !Number.isNaN(vect.y)) {
                    v.pos.sum(vect);
                }
                v.pos = this.getCoordsWithBoundaries(v.pos);
            }
        }
    }

    //Returns coordinates of v making sure that they are within at least ERDrawer.ER_DRAWING_MARGIN px from the border of the canvas
    private getCoordsWithBoundaries(v: Vector2D): Vector2D {
        return new Vector2D(Math.min(this.drawer.width - ERDrawer.ER_MARGIN, Math.max(0 + ERDrawer.ER_MARGIN, v.x)), Math.min(this.drawer.height - ERDrawer.ER_MARGIN, Math.max(0 + ERDrawer.ER_MARGIN, v.y)));
    }

    private ERtoRandomGraph(): [ERNode[], EREdge[]] {
        const erNodes: ERNode[] = [];
        const erEdges: EREdge[] = [];
        const minX = ERDrawer.ER_MARGIN, maxX = this.drawer.width - ERDrawer.ER_MARGIN, minY = ERDrawer.ER_MARGIN, maxY = this.drawer.height - ERDrawer.ER_MARGIN

        for (const entity of this.er.entities.values()) {
            erNodes.push({
                reference: entity,
                disp: new Vector2D(0, 0),
                pos: new Vector2D(Random.getRandom(minX, maxX), Random.getRandom(minY, maxY))
            });
        }

        for (const relationship of this.er.relationships.values()) {
            if (relationship.getEntityCounter() == 2) {
                erEdges.push({
                    reference: relationship,
                    erNode1: erNodes.find((erNode) => erNode.reference.label == relationship.entities[0].entity.label)!,
                    erNode2: erNodes.find((erNode) => erNode.reference.label == relationship.entities[1].entity.label)!,
                });
            } else {
                erNodes.push({
                    reference: relationship,
                    disp: new Vector2D(0, 0),
                    pos: new Vector2D(Random.getRandom(minX, maxX), Random.getRandom(minY, maxY))
                });
            }
        }

        return [erNodes, erEdges];
    }

    private graphToER(nodes: ERNode[], edges: EREdge[]): void {
        const er = new ERDiagram();
        const moreThanBinaryRelationships = [];
        for (const n of nodes) {
            if (n.reference instanceof Entity) {
                er.addEntity(new Entity(n.pos, n.reference.label));
            } else {
                moreThanBinaryRelationships.push(n);
            }
        }

        for (const n of moreThanBinaryRelationships) {
            const linkedEntities: RelationshipConnectionInfo[] = (n.reference as Relationship).entities.map((e) => ({
                entityLabel: e.entity.label,
                cardinality: e.cardinality
            }));
            er.addRelationship(n.reference.label, linkedEntities, n.pos);
        }

        for (const e of edges) {
            const linkedEntities: RelationshipConnectionInfo[] = e.reference.entities.map((e) => ({
                entityLabel: e.entity.label,
                cardinality: e.cardinality
            }));
            er.addRelationship(e.reference.label, linkedEntities);
        }

        this.er = er;
    }

}