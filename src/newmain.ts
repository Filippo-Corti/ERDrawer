import clone from "clone";
import Drawer from "./Drawer";
import { CardinalityValue } from "./er/Cardinality";
import Entity from "./er/Entity";
import ERDiagram from "./er/ERDiagram";
import ERDrawer from "./er/ERDrawer";
import Vector2D from "./utils/Vector2D";
import { ERDiagramSerializer } from "./er/ERDiagramSerializer";

const drawer = new Drawer("drawing-board");
const er = new ERDiagram();


er.addEntity(new Entity(new Vector2D(200, 300), "Prova"));
er.addEntity(new Entity(new Vector2D(600, 300), "Xyz"));
er.addEntity(new Entity(new Vector2D(400, 600), "Canguro"));
er.addEntity(new Entity(new Vector2D(600, 300), "Testa"));
er.addEntity(new Entity(new Vector2D(800, 500), "Coda"));

er.addAttributes(er.getEntity("Testa"), ["ciao"]);
er.addAttributes(er.getEntity("Testa"), ["b", "s", "q"]);
er.addAttributes(er.getEntity("Prova"), ["ciao", "cosa", "fai", "ecco", "ottimo", "ciao2", "ecco2", "ottimo3", "ciao5", "ecco6", "ottimo7", "ciao8"]);
er.addAttributes(er.getEntity("Xyz"), ["ciao"]);
er.addAttributes(er.getEntity("Canguro"), ["ciao", "pesce", "prova", "cannone", "anatra"]);
er.addAttributes(er.getEntity("Testa"), ["ciao"]);

er.addRelationship("Connesso", [
    {
        entityLabel: "Prova",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
    {
        entityLabel: "Xyz",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
]);
er.addRelationship("Connesso2", [
    {
        entityLabel: "Prova",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
    {
        entityLabel: "Xyz",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
]);
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
er.addRelationship("Ammesso", [
    {
        entityLabel: "Prova",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
    {
        entityLabel: "Canguro",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
]);
er.addRelationship("Ammesso", [
    {
        entityLabel: "Prova",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
    {
        entityLabel: "Canguro",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
    {
        entityLabel: "Xyz",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.N
        }
    },
]);
er.addRelationship("Collega", [
    {
        entityLabel: "Testa",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
    {
        entityLabel: "Canguro",
        cardinality: {
            min: CardinalityValue.ZERO,
            max: CardinalityValue.ONE
        }
    },
]);
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


er.addAttributes(er.getRelationship("Ammesso", ["Prova", "Canguro"]), ["ciao", "Cosa", "Uno", "Due", "Tre", "Quattro"]);


const erDrawer = new ERDrawer(er, drawer);

const e = erDrawer.er.getEntity("Prova");
// e.setPrimaryKey(["ciao", "ottimo", "fai"], [erDrawer.er.getRelationship("Connesso", ["Prova", "Xyz"])]);
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

function downloadFile(content: string, fileName: string) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}



// Layout Button

document.getElementById("layout-btn")!.addEventListener("click", () => {
    erDrawer.layout();
    erDrawer.drawER();
    console.log(clone(erDrawer.er));
});

// Export Button

document.getElementById("export-btn")!.addEventListener("click", () => {
    const graphJson = ERDiagramSerializer.exportDiagram(erDrawer.er);
    downloadFile(graphJson, 'er.json');
})


