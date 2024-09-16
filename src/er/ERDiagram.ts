import Drawable from "../utils/Drawable";
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

    addRelationship(entity1: string, entity2: string, label : string): void {
        const e1 = this.entities.get(entity1);
        const e2 = this.entities.get(entity2);

        if (!e1 || !e2) {
            throw new Error("The specified labels don't match any entity in the ER");
        }
        
        const relationshipKeyInMap = entity1 + "$" + label + "$" + entity2;
        if (this.relationships.has(relationshipKeyInMap)) {
            throw new Error("An Entity with the label " + relationshipKeyInMap + " already exists");
        }

        const middlePoint = e1.centerPoint.halfWayTo(e2.centerPoint);

        const newRelationship = new Relationship(middlePoint, label);
        newRelationship.linkToEntity(e1);
        newRelationship.linkToEntity(e2);
        this.relationships.set(relationshipKeyInMap, newRelationship);

        //Update edge's middlePoints
        //this.setEdgesMiddlePoints(label1, label2);
    }

}