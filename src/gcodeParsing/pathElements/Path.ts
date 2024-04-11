import {PathElement} from "./PathElement.ts";
import {PathOptions} from "src/component/gcodeEditor/GcodeEditor.tsx";

export class Path {

    elements : PathElement[] = [];
    reversePath: Path | undefined;

    toString(pathOptions : PathOptions) {
        return this.elements.map(e => e.toString(pathOptions)).join("\n");
    }

    createReversePath() {
        const newPath = new Path();
        newPath.elements = this.elements.map(e => e.createReversePathElement()).reverse()
        return newPath;
    }
}