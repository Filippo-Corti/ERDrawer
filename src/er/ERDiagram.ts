import Drawable from "../utils/Drawable";
import Vector2D from "../utils/Vector2D";
import Attribute from "./Attribute";
import { Cardinality } from "./Cardinality";
import Entity from "./Entity";
import Relationship from "./Relationship";
import Shape from "./Shape";
import ShapeWithAttributes from "./ShapeWithAttributes";

export type RelationshipConnectionInfo = {
    entityLabel: string,
    cardinality: Cardinality
}

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

    addRelationship(label: string, entities: RelationshipConnectionInfo[], centerPoint: Vector2D | null = null): void {
        if (entities.length < 2)
            throw new Error("At least two entities are required to form a relationship");

        entities.sort((a, b) => a.entityLabel.localeCompare(b.entityLabel));
        const entitiesLabels = entities.map((e) => e.entityLabel);

        const entityObjects = entities.map(connectionData => {
            const entity = this.entities.get(connectionData.entityLabel);
            if (!entity) {
                throw new Error("Entity " + connectionData.entityLabel + " does not exist in the ER");
            }
            return { entity, cardinality: connectionData.cardinality };
        });

        const relationshipKeyInMap = entitiesLabels.join('$') + "$" + label;
        if (this.relationships.has(relationshipKeyInMap)) {
            throw new Error(`A relationship with the label ${relationshipKeyInMap} already exists`);
        }

        if (!centerPoint) {
            const avgX = entityObjects.map((e) => e.entity.centerPoint.x).reduce((a, b) => a + b, 0) / entityObjects.length;
            const avgY = entityObjects.map((e) => e.entity.centerPoint.y).reduce((a, b) => a + b, 0) / entityObjects.length;
            centerPoint = new Vector2D(avgX, avgY);
        }

        const newRelationship = new Relationship(centerPoint, label);
        this.relationships.set(relationshipKeyInMap, newRelationship);

        for (const e of entityObjects) {
            e.entity.linkRelationship(newRelationship);
            newRelationship.linkToEntity(e.entity, e.cardinality);
        }
    }

    addAttributes(s: ShapeWithAttributes, attributes: string[]) {
        for (const attLabel of attributes) {
            const attribute = new Attribute(attLabel);
            s.addAttribute(attribute);
        }
    }

    addIdentifier(entityLabel: string, attributesLabels: string[], relationships: Relationship[] = []) {
        const entity = this.getEntity(entityLabel);
        if (attributesLabels.length > 0 || relationships.length > 0)
            entity.setPrimaryKey(attributesLabels, relationships);
    }

    getEntity(entityLabel: string): Entity {
        const found = this.entities.get(entityLabel);
        if (!found)
            throw new Error("Entity " + entityLabel + " does not exist in the ER");

        return found;
    }

    getRelationship(relationshipLabel: string, linkedEntitiesLabels: string[]): Relationship {
        linkedEntitiesLabels.sort();
        const relationshipKeyInMap = linkedEntitiesLabels.join('$') + "$" + relationshipLabel;

        const found = this.relationships.get(relationshipKeyInMap);
        if (!found)
            throw new Error("Relationship " + relationshipLabel + " does not exist in the ER");

        return found;
    }

    getAttribute(item: ShapeWithAttributes, attributeLabel: string) {
        return item.getAttribute(attributeLabel);
    }

    getAllShapes(): Shape[] {
        return (Array.from(this.entities.values()) as Shape[]).concat(Array.from(this.relationships.values()) as Shape[]);
    }

}