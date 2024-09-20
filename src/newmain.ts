import Drawer from "./Drawer";
import Entity from "./er/Entity";
import ERDiagram from "./er/ERDiagram";
import ERDrawer from "./er/ERDrawer";
import Vector2D from "./utils/Vector2D";

const drawer = new Drawer("drawing-board");
const er = new ERDiagram();


er.addEntity(new Entity(new Vector2D(200, 300), "Prova"));
er.addEntity(new Entity(new Vector2D(1200, 300), "Xyz"));
er.addEntity(new Entity(new Vector2D(400, 950), "Canguro"));

er.addRelationship(["Prova", "Xyz"], "Connesso");
er.addRelationship(["Prova", "Xyz"], "Connesso2");
er.addRelationship(["Prova", "Xyz"], "Connesso23");
er.addRelationship(["Prova", "Canguro"], "Ammesso");
er.addRelationship(["Prova", "Canguro", "Xyz"], "Ammesso");

const erDrawer = new ERDrawer(er, drawer);

er.addAttributes(er.getEntity("Prova"), ["ciao", "cosa", "fai", "ecco", "ottimo", "ciao", "ecco", "ottimo", "ciao", "ecco", "ottimo", "ciao"]);
er.addAttributes(er.getEntity("Xyz"), ["ciao"]);
er.addAttributes(er.getEntity("Canguro"), ["ciao", "pesce", "prova", "cannone", "anatra"]);
er.addAttributes(er.getRelationship("Ammesso", ["Prova", "Canguro"]), ["ciao", "Cosa", "Uno", "Due", "Tre", "Quattro"]);
er.addAttributes(er.getRelationship("Connesso2", ["Prova", "Xyz"]), ["ciao"]);

const e = er.getEntity("Canguro");
e.setPrimaryKey([e.getAttribute("ciao"), er.getRelationship("Ammesso", ["Prova", "Canguro", "Xyz"]), e.getAttribute("pesce")]);

console.log(er);
erDrawer.drawER();

//Draw Point

document.getElementById("addpoint-form")!.addEventListener("submit", (event) => addPoint(event));

function addPoint(event: Event): boolean {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const x = parseInt(formData.get("x") as string);
    const y = parseInt(formData.get("y") as string);

    console.log(x, y);

    erDrawer.drawer.drawPoint(x, y, undefined, "green");
    return false;
}