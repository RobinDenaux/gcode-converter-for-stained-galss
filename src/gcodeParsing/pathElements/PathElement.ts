import {Point} from "./Point.ts";
import {PathOptions} from "src/component/GcodeEditor.tsx";

export interface PathElement {

    length(): number;

    startAngle(): number;
    endAngle(): number;

    startPoint(): Point;
    endPoint(): Point;
    type: string;

    toString(pathOptions : PathOptions): string;

    createReversePathElement(): PathElement;
}