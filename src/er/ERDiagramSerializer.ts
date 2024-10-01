
import Vector2D from "../utils/Vector2D";
import Attribute from "./Attribute";
import Entity from "./Entity";
import ERDiagram from "./ERDiagram";
import Relationship from "./Relationship";

type ERDiagramSerialData = {
    relationships: Array<RelationshipSerialData>,
    entities: Array<EntitySerialData>,
}

type RelationshipSerialData = {
    id: number,
    label: string,
    centerPoint: { x: number, y: number },
    delta: number,
    connectionPointsAttributes: Array<{
        pos: { x: number, y: number },
        value: {
            label: string,
            segmentDirection: number,
            filledPoint: boolean
        }
    }>,
    connectionPointsEntities: Array<{
        pos: { x: number, y: number },
        id: number
    }>
}

type EntitySerialData = {
    id: number,
    label: string,
    centerPoint: { x: number, y: number },
    deltaX: number,
    deltaY: number,
    connectionPointsAttributes: Array<{
        pos: { x: number, y: number },
        value: {
            label: string,
            segmentDirection: number,
            filledPoint: boolean
        }
    }>,
    connectionPointsRelationships: Array<{
        pos: { x: number, y: number },
        id: number
    }>
}

type RelationshipMapData = {
    id: number,
    reference: Relationship,
    serialData: RelationshipSerialData
}

type EntityMapData = {
    id: number,
    reference: Entity,
    serialData: EntitySerialData
}

export class ERDiagramSerializer {

    static exportDiagram(er: ERDiagram): string {
        let relationships: Map<Relationship, RelationshipMapData> = new Map<Relationship, RelationshipMapData>();
        let entities: Map<Entity, EntityMapData> = new Map<Entity, EntityMapData>();

        let i = 0;
        for (const relationship of er.relationships.values()) {
            const serializedRelationship = {
                id: i,
                label: relationship.label,
                centerPoint: { x: relationship.centerPoint.x, y: relationship.centerPoint.y },
                delta: relationship.delta,
                connectionPointsAttributes: Array.from(relationship.connectionPoints.values()).filter((cp) => cp.value instanceof Attribute).map((cp) => {
                    const attribute = cp.value as Attribute;
                    return {
                        pos: { x: cp.pos.x, y: cp.pos.y },
                        value: {
                            label: attribute.label,
                            segmentDirection: attribute.segmentDirection,
                            filledPoint: attribute.filledPoint,
                        }
                    };
                }),
                connectionPointsEntities: [],
            };
            relationships.set(relationship, {
                id: i,
                reference: relationship,
                serialData: serializedRelationship
            });
        }

        for (const entity of er.entities.values()) {
            const serializedEntity = {
                id: i++,
                label: entity.label,
                centerPoint: { x: entity.centerPoint.x, y: entity.centerPoint.y },
                deltaX: entity.deltaX,
                deltaY: entity.deltaY,
                connectionPointsAttributes: Array.from(entity.connectionPoints.values()).filter((cp) => cp.value instanceof Attribute).map((cp) => {
                    const attribute = cp.value as Attribute;
                    return {
                        pos: { x: cp.pos.x, y: cp.pos.y },
                        value: {
                            label: attribute.label,
                            segmentDirection: attribute.segmentDirection,
                            filledPoint: attribute.filledPoint,
                        }
                    };
                }),
                connectionPointsRelationships: [],
            };
            entities.set(entity, {
                id: i,
                reference: entity,
                serialData: serializedEntity
            });
        }


        for (const entity of er.entities.values()) {
            const entityData = entities.get(entity);
            entityData!.serialData.connectionPointsRelationships = Array.from(entity.connectionPoints.values()).filter((cp) => cp.value instanceof Relationship).map((cp) => {
                const relationship = cp.value as Relationship;
                return {
                    pos: { x: cp.pos.x, y: cp.pos.y },
                    id: relationships.get(relationship)!.id,
                };
            });
        }

        for (const relationship of er.relationships.values()) {
            const relationshipData = relationships.get(relationship);
            relationshipData!.serialData.connectionPointsEntities = Array.from(relationship.connectionPoints.values()).filter((cp) => cp.value instanceof Entity).map((cp) => {
                const entity = cp.value as Entity;
                return {
                    pos: { x: cp.pos.x, y: cp.pos.y },
                    id: entities.get(entity)!.id,
                };
            });
        }

        const serializedGraph: ERDiagramSerialData = {
            relationships: Array.from(relationships.values()).map((r) => r.serialData),
            entities: Array.from(entities.values()).map((e) => e.serialData),
        };

        return JSON.stringify(serializedGraph, null, 2);
    }

    static importDiagram(json: string): ERDiagram {
        const parsedData: ERDiagramSerialData = JSON.parse(json);
        const erDiagram = new ERDiagram();

        const relationshipsMap = new Map<number, Relationship>();
        for (const relationshipData of parsedData.relationships) {
            const relationship = new Relationship(new Vector2D(relationshipData.centerPoint.x, relationshipData.centerPoint.y), relationshipData.label);
            relationship.delta = relationshipData.delta;
            relationshipsMap.set(relationshipData.id, relationship);
        }



        return erDiagram;
    }

    // Just for developement 
    // static async importGraphFromLocalFile(fileName: string): Promise<ERDiagram> {
    //     let graph: ERDiagram = new ERDiagram();
    //     await fetch(fileName)
    //         .then(response => response.text())
    //         .then(data => {
    //             graph = ERDiagramSerializer.importDiagram(data);
    //             console.log('Loaded ER Diagram from ' + fileName + ': ', graph);
    //         })
    //         .catch(error => console.error('Error loading ER Diagram:', error));
    //     return graph;
    // }


}