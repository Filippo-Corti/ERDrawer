import Drawer from "../Drawer";
import ERDiagram from "./ERDiagram";

export default class ERDrawer {

    er : ERDiagram;
    drawer : Drawer;

    constructor(er : ERDiagram, drawer : Drawer) {
        this.er = er;
        this.drawer = drawer;
    }

    drawER() {
        this.drawer.clear();
        this.er.draw(this.drawer.ctx);
    }

}