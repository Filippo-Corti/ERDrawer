import './style.css'
import { Drawer } from './Drawer';
import { GraphDrawer } from './graph/GraphDrawer.ts';
import { GraphSerializer } from './graph/GraphSerializer.ts';
import { Node } from './graph/Node.ts';
import { Random } from './utils/Utils.ts';
import { ERDiagramSerializer } from './erdiagram/ERDiagramSerializer.ts';


const GRAPH_FILENAME = 'tesine.json';

const drawer = new Drawer("drawing-board");
//const graph = await GraphSerializer.importGraphFromFile('./graphs/' + GRAPH_FILENAME);
const graph = await ERDiagramSerializer.importGraphFromFile('./graphs/' + GRAPH_FILENAME);
const graphDrawer = new GraphDrawer(drawer, graph);
graphDrawer.drawGraph();


// Layout Button

document.getElementById("layout-btn")!.addEventListener("click", () => {
    graphDrawer.executeFructhermanReingold(1000, 25);
    graphDrawer.drawGraph();
});

// Discretize Button

document.getElementById("discretize-btn")!.addEventListener("click", () => {
    graphDrawer.positionElegantly(5000, 200);
    graphDrawer.drawGraph();
    console.log(graphDrawer.graph);
});

// Export Button

document.getElementById("export-btn")!.addEventListener("click", () => {
    const graphJson = GraphSerializer.exportGraph(graphDrawer.graph);
    downloadFile(graphJson, 'graph.json');
})

// Import Button

document.getElementById("import-btn")!.addEventListener("click", () => {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const file = fileInput.files ? fileInput.files[0] : null;
    if (!file)
        return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const graphJson = event.target!.result as string;
        const graph = GraphSerializer.importGraph(graphJson);
        graphDrawer.graph = graph.clone();
        graphDrawer.drawGraph();
    };
    reader.readAsText(file);
})

// Update Canvas Button

document.getElementById("canvas-btn")!.addEventListener("click", () => {
    graphDrawer.drawer.canvas.width += GraphDrawer.DELTA;
    graphDrawer.drawGraph();
})

// Add Node Button

document.getElementById("newnode-btn")!.addEventListener("click", () => {
    graphDrawer.graph.addNode(new Node("Prova" + Random.getRandom(0, 10), Random.getRandom(50, graphDrawer.drawer.canvas.width - 50), Random.getRandom(50, graphDrawer.drawer.canvas.height - 50)));
    graphDrawer.graph.addEdge("Prova" + Random.getRandom(0, 10), "Prova" + Random.getRandom(0, 10));
    graphDrawer.drawGraph();
})

// Utils

function downloadFile(content: string, fileName: string) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
}


//For debug
function waitingKeypress() {
    return new Promise<void>((resolve) => {
        document.addEventListener('keydown', onKeyHandler);
        function onKeyHandler(e: { keyCode: number; }) {
            if (e.keyCode === 13) {
                document.removeEventListener('keydown', onKeyHandler);
                resolve();
            }
        }
    });
}