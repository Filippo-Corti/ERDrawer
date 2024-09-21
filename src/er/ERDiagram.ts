import Drawable from "../utils/Drawable";
import Vector2D from "../utils/Vector2D";
import Attribute from "./Attribute";
import { Cardinality } from "./Cardinality";
import Entity from "./Entity";
import Relationship from "./Relationship";
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
            return {entity, cardinality: connectionData.cardinality};
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

        this.positionRelationships(entitiesLabels);
    }

    addAttributes(s: ShapeWithAttributes, attributes: string[]) {
        for (const attLabel of attributes) {
            const attribute = new Attribute(attLabel);
            s.addAttribute(attribute);
        }
    }

    positionRelationships(entities: string[]) {
        const entitiesKeyPrefix = entities.join('$') + "$";
        const involvedRelationships: Relationship[] = [];

        const involvedEntities: Entity[] = entities.map((entityName) => this.entities.get(entityName)!);

        for (const [k, v] of this.relationships) {
            if (k.startsWith(entitiesKeyPrefix)) {
                involvedRelationships.push(v);
            }
        }
        const countRel: number = involvedRelationships.length;

        if (countRel <= 1) return;

        const middle = involvedEntities[0].centerPoint.halfWayTo(involvedEntities[1].centerPoint);
        const theta = Vector2D.sum(involvedEntities[0].centerPoint, involvedEntities[1].centerPoint.negative()).phase();

        let sign: number = 1;
        const evenCount: boolean = countRel % 2 == 0;
        for (let i = 0; i < countRel; i++) {
            const offsetFactor = (!evenCount && i == 0) ? 0 : Math.floor((i + 1 + ((evenCount) ? 1 : 0)) / 2) / ((evenCount) ? 2 : 1);
            const offsetBase = Relationship.MULTIPLE_RELATIONSHIPS_OFFSET;
            const dx = sign * offsetBase * offsetFactor * Math.sin(theta);
            const dy = sign * offsetBase * offsetFactor * -Math.cos(theta);
            involvedRelationships[i].updateCenterPoint(Vector2D.sum(middle, new Vector2D(dx, dy)));

            sign *= -1;
        }

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

}