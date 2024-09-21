export enum CardinalityValue {
    ZERO = "0",
    ONE = "1",
    N = "N"
}

export type Cardinality = {
    min: CardinalityValue,
    max: CardinalityValue
}

export function stringValue(c: Cardinality) {
    return "(" + c.min + "," + c.max + ")";
}