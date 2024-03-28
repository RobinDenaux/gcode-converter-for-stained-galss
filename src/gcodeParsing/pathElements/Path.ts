import {PathElement} from "./PathElement.ts";

export class Path {

    elements : PathElement[] = [];

    toString() {
        return this.elements.map(e => e.toString()).join("\n");
    }
}