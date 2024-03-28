import {Point} from "./Point.ts";

export interface PathElement {

    length(): number;

    startAngle(): number;
    endAngle(): number;

    startPoint(): Point;
    endPoint(): Point;
    type: string;

    toString(): string;
}