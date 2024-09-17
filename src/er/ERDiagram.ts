import Drawable from "../utils/Drawable";
import Vector2D from "../utils/Vector2D";
import Entity from "./Entity";
import Relationship from "./Relationship";

export default class ERDiagram implements Drawable {

    entities: Map<string, Entity>;
    relationships: Map<string, Relationship>;

    constructor() {
        this.entities = new Map<string, Entity>;
        this.relationships = new Map<string, Relationship>;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.entities.forEach(edge => edge.draw(ctx));
        this.relationships.forEach(node => node.draw(ctx));
    }

    addEntity(e: Entity): void {
        if (this.entities.has(e.label)) {
            throw new Error("An Entity with the label " + e.label + " already exists");
        }

        this.entities.set(e.label, e);
    }

    addRelationship(entities: string[], label: string, centerPoint: Vector2D | null = null): void {
        if (entities.length < 2) {
            throw new Error("At least two entities are required to form a relationship.");
        }

        entities.sort();

        const entityObjects = entities.map(entityName => {
            const entity = this.entities.get(entityName);
            if (!entity) {
                throw new Error(`Entity "${entityName}" does not exist in the ER`);
            }
            return entity;
        });

        const relationshipKeyInMap = entities.join('$') + "$" + label;
        if (this.relationships.has(relationshipKeyInMap)) {
            throw new Error(`A relationship with the label ${relationshipKeyInMap} already exists`);
        }

        if (!centerPoint) {
            const avgX = entityObjects.map((e) => e.centerPoint.x).reduce((a, b) => a + b, 0) / entityObjects.length;
            const avgY = entityObjects.map((e) => e.centerPoint.y).reduce((a, b) => a + b, 0) / entityObjects.length;
            centerPoint = new Vector2D(avgX, avgY);
        }


        const newRelationship = new Relationship(centerPoint, label);
        this.relationships.set(relationshipKeyInMap, newRelationship);

        for (const e of entityObjects) {
            e.linkRelationship(newRelationship);
            newRelationship.linkToEntity(e);
        }

        //Update edge's middlePoints
        //this.setEdgesMiddlePoints(label1, label2);
    }

}