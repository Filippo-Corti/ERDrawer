import Drawer from "../Drawer";
import { Segment } from "../utils/Segment";
import { Random } from "../utils/Utils";
import Vector2D from "../utils/Vector2D";
import Entity from "./Entity";
import ERDiagram, { RelationshipConnectionInfo } from "./ERDiagram";
import Relationship from "./Relationship";
import Shape from "./Shape";

import clone from "clone";
import ShapeWithAttributes from "./ShapeWithAttributes";

type ERNode = {
    reference: ShapeWithAttributes, // Multi-Relationship or Entity
    disp: Vector2D,
    pos: Vector2D,
    repulsionIntensity: number
}

type EREdge = {
    references: Relationship[] | null, // Binary Relationship array or null if it's an edge between Entity and Multi-Relationship
    erNode1: ERNode,
    erNode2: ERNode,
    count: number
}

export default class ERDrawer {

    static ER_MARGIN: number = 200;
    static DELTA = 200;

    er: ERDiagram;
    drawer: Drawer;
    i : number = 0;

    constructor(er: ERDiagram, drawer: Drawer) {
        this.er = er;
        this.drawer = drawer;
    }

    drawER() {
        this.drawer.clear();
        this.er.draw(this.drawer.ctx);
    }

    layout() {
        this.i++;
        const [nodes, edges] = this.chooseBestGraphLayout(50, 300);
        this.graphToER(nodes, edges);
    }

    chooseBestGraphLayout(numberOfGraphs: number, iterationsPerGraph: number): [ERNode[], EREdge[]] {
        let minCrossings = 100;
        let bestGraphLayout = this.ERtoRandomGraph();

        for (let i = 0; i < numberOfGraphs; i++) {
            // Generate New Random Graph 
            const [nodes, edges] = this.ERtoRandomGraph();

            // Apply the Layout Algorithm
            this.executeFructhermanReingold(nodes, edges, iterationsPerGraph);
            this.discretizeNodesCoordinates(nodes);

            // Reset Nodes connection points
            // this.graph.nodes.forEach((n) => n.resetConnectionPoints());
            // // Calculate Edges positions (based on new nodes positions!)
            // try {
            //     this.graph.layoutEdges();
            // } catch (error) {
            //     continue; // If you can't calculate new vertices, it's not a good layout
            // }

            // Check if current layout is better than the best one so far (the new edge positions are used!)
            let crossings = this.countEdgeCrossings(edges);
            if (crossings < minCrossings && !this.doesAnyEdgeCrossANode(nodes, edges)) {
                minCrossings = crossings;
                bestGraphLayout = [clone(nodes), clone(edges)];
            }
        }
        console.log("Least amount of crossings: ", minCrossings);
        return bestGraphLayout
    }

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
                    const gammaAbs: number = gamma.magnitude() / u.repulsionIntensity;
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

    //Positions Nodes in a discretized grid.
    //If two Nodes would occupy the same spot, the discretization doesn't happen
    discretizeNodesCoordinates(nodes: ERNode[]): void {
        const rows = Math.floor(this.drawer.height / ERDrawer.DELTA + 1);
        const cols = Math.floor(this.drawer.width / ERDrawer.DELTA + 1);

        var nodesPerSquare: ERNode[][] = Array.from({ length: rows * cols }, () => []);
        for (const v of nodes) {
            const discrCoords = this.getDiscretizedCoords(v.pos);
            const nodeCol = Math.round(discrCoords.x / ERDrawer.DELTA);
            const nodeRow = Math.round(discrCoords.y / ERDrawer.DELTA);
            nodesPerSquare[nodeRow * cols + nodeCol].push(v);
        }

        //Discretize only if 1 per square
        nodesPerSquare.filter((a) => a.length <= 1).forEach((a) => {
            a.forEach((node) => node.pos = this.getDiscretizedCoords(node.pos));
        })

    }

    //Returns the discrete coordinates of v, within the boundaries of the drawing canvas
    private getDiscretizedCoords(v: Vector2D): Vector2D {
        return this.getCoordsWithBoundaries(new Vector2D(Math.round(v.x / ERDrawer.DELTA) * ERDrawer.DELTA, Math.round(v.y / ERDrawer.DELTA) * ERDrawer.DELTA));
    }

    //Returns coordinates of v making sure that they are within at least ERDrawer.ER_DRAWING_MARGIN px from the border of the canvas
    private getCoordsWithBoundaries(v: Vector2D): Vector2D {
        return new Vector2D(Math.min(this.drawer.width - ERDrawer.ER_MARGIN, Math.max(0 + ERDrawer.ER_MARGIN, v.x)), Math.min(this.drawer.height - ERDrawer.ER_MARGIN, Math.max(0 + ERDrawer.ER_MARGIN, v.y)));
    }

    //Returns the number of edge pairs that intersect in the current graph disposition
    // + the number of edges that intersect with a node
    countEdgeCrossings(edges: EREdge[]): number {
        let count: number = 0;
        for (let i = 0; i < edges.length; i++) {
            const e = edges[i];
            const s1 = Segment.fromVectors(e.erNode1.pos, e.erNode2.pos);

            for (let j = i + 1; j < edges.length; j++) {
                const f = edges[j];
                const s2 = Segment.fromVectors(f.erNode1.pos, f.erNode2.pos);

                if (s1.intersects(s2)) {
                    if (s1.parallel(s2)) {
                        count += 999; // This is a crossing we really want to avoid
                    } else {
                        if (!(s1.a.equals(s2.a) || s1.a.equals(s2.b) || s1.b.equals(s2.a) || s1.b.equals(s2.b))) {
                            count += 1;
                        }
                    }
                }

            }
        }
        return count;
    }

    //Returns whether an Edge is crossing a Node or not.
    doesAnyEdgeCrossANode(nodes: ERNode[], edges: EREdge[], minOffset: number = 50): boolean {
        for (const e of edges) {
            for (const v of nodes) {
                if (v == e.erNode1 || v == e.erNode2) continue;

                const s = Segment.fromVectors(e.erNode1.pos, e.erNode2.pos);
                if (s.distanceToPoint(v.pos) < Math.hypot(Entity.HALF_DIM_X, Entity.HALF_DIM_Y) + minOffset) {
                    //console.log("Distance between the edge " + e.node1.label + " - " + e.node2.label + " and the node " + v.label + " is too short.");
                    return true;
                }
            }
        }
        return false;
    }

    private ERtoRandomGraph(): [ERNode[], EREdge[]] {
        const erNodes: ERNode[] = [];
        let erEdges: EREdge[] = [];
        const minX = ERDrawer.ER_MARGIN, maxX = this.drawer.width - ERDrawer.ER_MARGIN, minY = ERDrawer.ER_MARGIN, maxY = this.drawer.height - ERDrawer.ER_MARGIN

        for (const entity of this.er.entities.values()) {
            erNodes.push({
                reference: entity,
                disp: new Vector2D(0, 0),
                pos: new Vector2D(Random.getRandom(minX, maxX), Random.getRandom(minY, maxY)),
                repulsionIntensity: 1
            });
        }

        for (const relationship of this.er.relationships.values()) {
            if (relationship.getEntityCounter() == 2) {
                const erNode1 = erNodes.find((erNode) => erNode.reference.label == relationship.entities[0].entity.label)!;
                const erNode2 = erNodes.find((erNode) => erNode.reference.label == relationship.entities[1].entity.label)!;
                let existingEdge = erEdges.find((e) => e.erNode1 == erNode1 && e.erNode2 == erNode2);
                let count = 1;
                let references = [relationship];
                if (existingEdge) {
                    erEdges = erEdges.filter((e) => e !== existingEdge); //Remove edge
                    count = existingEdge.count++;
                    references = [...existingEdge.references!, relationship];
                }
                erEdges.push({
                    references: references,
                    erNode1: erNode1,
                    erNode2: erNode2,
                    count: count
                });
            } else {
                const node = {
                    reference: relationship,
                    disp: new Vector2D(0, 0),
                    pos: new Vector2D(Random.getRandom(minX, maxX), Random.getRandom(minY, maxY)),
                    repulsionIntensity: 0.5
                };
                erNodes.push(node);
                for (const connectedEntity of relationship.entities) {
                    erEdges.push({
                        references: null,
                        erNode1: node,
                        erNode2: erNodes.find((erNode) => erNode.reference.label == connectedEntity.entity.label)!,
                        count: 1
                    });
                }
            }
        }

        return [erNodes, erEdges];
    }

    private graphToER(nodes: ERNode[], edges: EREdge[]): void {
        const er = new ERDiagram();
        const moreThanBinaryRelationships = [];
        for (const n of nodes) {
            if (n.reference instanceof Entity) {
                const newEntity = new Entity(n.pos, n.reference.label)
                const attributeLabels = n.reference.attributes.map((a) => a.label);
                er.addEntity(newEntity);
                er.addAttributes(newEntity, attributeLabels);
            } else {
                moreThanBinaryRelationships.push(n);
            }
        }
        
        for (const n of moreThanBinaryRelationships) {
            const linkedEntities: RelationshipConnectionInfo[] = (n.reference as Relationship).entities.map((e) => ({
                entityLabel: e.entity.label,
                cardinality: e.cardinality
            }));
            const attributeLabels = n.reference.attributes.map((a) => a.label);
            er.addRelationship(n.reference.label, linkedEntities, n.pos);
            er.addAttributes(er.getRelationship(n.reference.label, linkedEntities.map((le) => le.entityLabel)), attributeLabels);
        }



        for (const e of edges) {
            if(e.references == null) continue;
            for(let reference of e.references) {
                const linkedEntities: RelationshipConnectionInfo[] = reference.entities.map((e) => ({
                    entityLabel: e.entity.label,
                    cardinality: e.cardinality
                }));
                const attributeLabels = reference.attributes.map((a) => a.label);
                er.addRelationship(reference.label, linkedEntities);
                er.addAttributes(er.getRelationship(reference.label, linkedEntities.map((le) => le.entityLabel)), attributeLabels);
            }
        }

        this.er = er;
    }

}