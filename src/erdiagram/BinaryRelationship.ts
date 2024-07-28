import { Edge } from "../graph/Edge";
import { Node } from "../graph/Node";


export class BinaryRelationship extends Edge {

    labels: string[];

    constructor(node1: Node, node2: Node, count: number = 1, labels: string[]) {
        super(node1, node2, count);
        this.labels = [];
        if (labels.length < count) {
            console.log(node1.label, node2.label, count, labels);
            throw new Error("Not enough labels");
        }
        for (let i = 0; i < count; i++) {
            this.labels.push(labels[i]);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const OFFSET_BETWEEN_MULTIEDGES = 150; //In the center
        const mx = (this.node2.pos.x + this.node1.pos.x) / 2;
        const my = (this.node2.pos.y + this.node1.pos.y) / 2;
        for (let i = 0; i < this.count; i++) {
            // Calculate offset
            const theta = Math.atan2(this.node2.pos.y - this.node1.pos.y, this.node2.pos.x - this.node1.pos.x);
            const offsetFactor = (i - (this.count - 1) / 2);
            const dx = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * Math.sin(theta);
            const dy = OFFSET_BETWEEN_MULTIEDGES * offsetFactor * -Math.cos(theta);
            const PADDING = (this.labels[i].length < 5) ? 15 : 4;

            // Draw Edge
            ctx.beginPath();
            ctx.moveTo(this.node1.pos.x, this.node1.pos.y);
            ctx.lineTo(mx + dx, my + dy);
            ctx.lineTo(this.node2.pos.x, this.node2.pos.y);
            ctx.stroke();

            // Draw Rhombus half way
            const halfDiagY = 50, halfDiagX = 70;
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.moveTo(mx + dx, my + dy - halfDiagY);
            ctx.lineTo(mx + dx + halfDiagX, my + dy);
            ctx.lineTo(mx + dx, my + dy + halfDiagY);
            ctx.lineTo(mx + dx - halfDiagX, my + dy);
            ctx.lineTo(mx + dx, my + dy - halfDiagY);
            ctx.fill();
            ctx.stroke();

            //Draw Label
            ctx.fillStyle = "black";
            let fontSize = halfDiagX * 1.25;
            do {
                ctx.font = fontSize + "px serif";
                fontSize -= 3;
            } while (ctx.measureText(this.labels[i]).width > (halfDiagX * 1.25 - PADDING));
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.labels[i], mx + dx, my + dy);

        }
    }
}