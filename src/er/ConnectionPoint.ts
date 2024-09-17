import Vector2D from "../utils/Vector2D"
import Connectable from "./Connectable";

export type ConnectionPoint = {

    pos: Vector2D,
    value: Connectable | null,
    outDirection : number,

}
