import Drawer from "./Drawer";
import Entity from "./er/Entity";
import ERDiagram from "./er/ERDiagram";
import ERDrawer from "./er/ERDrawer";
import Vector2D from "./utils/Vector2D";

const drawer = new Drawer("drawing-board");
const er = new ERDiagram();

er.addEntity(new Entity(new Vector2D(100, 200), "Prova"));
er.addEntity(new Entity(new Vector2D(600, 200), "Xyz"));
er.addEntity(new Entity(new Vector2D(300, 600), "Canguro"));

er.addRelationship("Prova", "Xyz", "Connesso");
er.addRelationship("Prova", "Canguro", "Ammesso");

const erDrawer = new ERDrawer(er, drawer);
erDrawer.drawER();