import {Point} from "./Point.ts";
import {PathOptions} from "src/component/gcodeEditor/GcodeEditor.tsx";

export interface PathElement {

    length(): number;

    startAngle(): number;
    endAngle(): number;

    startPoint: Point;
    endPoint: Point;
    type: "G00" | "G01" | "G02" | "G03";

    toString(pathOptions : PathOptions): string;

    createReversePathElement(): PathElement;
}