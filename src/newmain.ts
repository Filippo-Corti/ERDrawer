import Drawer from "./Drawer";
import { CardinalityValue } from "./er/Cardinality";
import Entity from "./er/Entity";
import ERDiagram from "./er/ERDiagram";
import ERDrawer from "./er/ERDrawer";
import Vector2D from "./utils/Vector2D";

const drawer = new Drawer("drawing-board");
const er = new ERDiagram();


// er.addEntity(new Entity(new Vector2D(200, 300), "Prova"));
// er.addEntity(new Entity(new Vector2D(600, 300), "Xyz"));
// er.addEntity(new Entity(new Vector2D(400, 600), "Canguro"));
er.addEntity(new Entity(new Vector2D(600, 300), "Testa"));
er.addEntity(new Entity(new Vector2D(800, 500), "Coda"));

// er.addRelationship("Connesso", [
//     {
//         entityLabel: "Prova",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
//     {
//         entityLabel: "Xyz",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
// ]);
// er.addRelationship("Connesso2", [
//     {
//         entityLabel: "Prova",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
//     {
//         entityLabel: "Xyz",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
// ]);
// er.addRelationship("Connesso23", [
//     {
//         entityLabel: "Prova",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
//     {
//         entityLabel: "Xyz",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
// ]);
// er.addRelationship("Ammesso", [
//     {
//         entityLabel: "Prova",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
//     {
//         entityLabel: "Canguro",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
// ]);
// er.addRelationship("Ammesso", [
//     {
//         entityLabel: "Prova",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
//     {
//         entityLabel: "Canguro",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
//     {
//         entityLabel: "Xyz",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.N
//         }
//     },
// ]);
// er.addRelationship("Collega", [
//     {
//         entityLabel: "Testa",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
//     {
//         entityLabel: "Canguro",
//         cardinality: {
//             min: CardinalityValue.ZERO,
//             max: CardinalityValue.ONE
//         }
//     },
// ]);
er.addRelationship("Opsss", [
    {
        entityLabel: "Testa",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
    {
        entityLabel: "Coda",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
]);


const erDrawer = new ERDrawer(er, drawer);

erDrawer.layout();
console.log("----------------------------");
er.addAttributes(erDrawer.er.getEntity("Testa"), ["ciao"]);
er.addAttributes(erDrawer.er.getEntity("Testa"), ["b", "s", "q", "baba", "scemo", "w",]);
// erDrawer.er.addAttributes(erDrawer.er.getEntity("Prova"), ["ciao", "cosa", "fai", "ecco", "ottimo", "ciao2", "ecco2", "ottimo3", "ciao5", "ecco6", "ottimo7", "ciao8"]);
// erDrawer.er.addAttributes(erDrawer.er.getEntity("Xyz"), ["ciao"]);
// erDrawer.er.addAttributes(erDrawer.er.getEntity("Canguro"), ["ciao", "pesce", "prova", "cannone", "anatra"]);
// erDrawer.er.addAttributes(erDrawer.er.getEntity("Testa"), ["ciao"]);
// erDrawer.er.addAttributes(erDrawer.er.getRelationship("Ammesso", ["Prova", "Canguro"]), ["ciao", "Cosa", "Uno", "Due", "Tre", "Quattro"]);
//erDrawer.er.addAttributes(erDrawer.er.getRelationship("Connesso2", ["Prova", "Xyz"]), ["ciao"]);

// const e = erDrawer.er.getEntity("Prova");
// e.setPrimaryKey([e.getAttribute("ciao"), erDrawer.er.getRelationship("Connesso", ["Prova", "Xyz"]), e.getAttribute("fai"), e.getAttribute("ottimo")]);
//erDrawer.er.getEntity("Testa").setPrimaryKey([erDrawer.er.getRelationship("Collega", ["Canguro", "Testa"]), erDrawer.er.getRelationship("Opsss", ["Coda", "Testa"])]);


console.log(erDrawer.er);
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


// Layout Button

document.getElementById("layout-btn")!.addEventListener("click", () => {
    erDrawer.layout();
    erDrawer.er.addAttributes(erDrawer.er.getEntity("Prova"), ["ciao", "cosa", "fai", "ecco", "ottimo", "ciao2", "ecco2", "ottimo3", "ciao5", "ecco6", "ottimo7", "ciao8"]);
    erDrawer.er.addAttributes(erDrawer.er.getEntity("Xyz"), ["ciao"]);
    erDrawer.er.addAttributes(erDrawer.er.getEntity("Canguro"), ["ciao", "pesce", "prova", "cannone", "anatra"]);
    erDrawer.er.addAttributes(erDrawer.er.getEntity("Testa"), ["ciao"]);
    erDrawer.er.addAttributes(erDrawer.er.getRelationship("Ammesso", ["Prova", "Canguro"]), ["ciao", "Cosa", "Uno", "Due", "Tre", "Quattro"]);
    //erDrawer.er.addAttributes(erDrawer.er.getRelationship("Connesso2", ["Prova", "Xyz"]), ["ciao"]);

    const e = erDrawer.er.getEntity("Prova");
    e.setPrimaryKey([e.getAttribute("ciao"), erDrawer.er.getRelationship("Connesso", ["Prova", "Xyz"]), e.getAttribute("fai"), e.getAttribute("ottimo")]);
    //erDrawer.er.getEntity("Testa").setPrimaryKey([erDrawer.er.getRelationship("Collega", ["Canguro", "Testa"]), erDrawer.er.getRelationship("Opsss", ["Coda", "Testa"])]);

    erDrawer.drawER();
});