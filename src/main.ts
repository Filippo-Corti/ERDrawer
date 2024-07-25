import './style.css'
import { Drawer } from './Drawer';
import { GraphDrawer } from './GraphDrawer.ts';
import { GraphSerializer } from './graph/GraphSerializer.ts';


const GRAPH_FILENAME = 'sales.json';

const drawer = new Drawer("drawing-board");
const graph = await GraphSerializer.importGraphFromFile('./graphs/' + GRAPH_FILENAME);
const graphDrawer = new GraphDrawer(drawer, graph);
graphDrawer.drawGraph();

const layoutBtn = document.getElementById("layout-btn")
const discretizeBtn = document.getElementById("discretize-btn")
const exportBtn = document.getElementById("export-btn")
const importBtn = document.getElementById("import-btn")

layoutBtn?.addEventListener("click", () => {
    graphDrawer.executeFructhermanReingold(1000, 50);
    graphDrawer.drawGraph();
});

discretizeBtn?.addEventListener("click", () => {
    graphDrawer.positionElegantly();
    graphDrawer.drawGraph();
});

exportBtn?.addEventListener("click", () => {
    const graphJson = GraphSerializer.exportGraph(graphDrawer.graph);
    downloadFile(graphJson, 'graph.json');
})

importBtn?.addEventListener("click", () => {
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