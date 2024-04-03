import {Point} from "./Point.ts";
import {PathElement} from "./PathElement.ts";
import {PathOptions} from "src/component/GcodeEditor.tsx";

export class Arc implements PathElement {

    type : "G02" | "G03";
    p1 : Point;
    p2 : Point;
    center : Point;
    radius : number;
    _startAngle : number;
    _endAngle : number;

    constructor(type : "G02" | "G03", startPoint : Point, endPoint : Point, center : Point) {
        this.p1 = startPoint;
        this.p2 = endPoint;
        this.center = center;
        this.type = type;
        this.radius = startPoint.distanceTo(center);
        this._startAngle = Math.atan2(this.p1.y - this.center.y, this.p1.x - this.center.x) + (this.type === "G02" ? -Math.PI/2 : Math.PI/2);
        this._endAngle = Math.atan2(this.p2.y - this.center.y, this.p2.x - this.center.x) + (this.type === "G02" ? -Math.PI/2 : Math.PI/2);
    }

    length() {
        return this.radius * (this.endAngle() - this.startAngle());
    }

    startAngle() {
        return this._startAngle
    }

    endAngle() {
        return this._endAngle
    }

    startPoint(): Point {
        return this.p1;
    }

    endPoint(): Point {
        return this.p2;
    }

    toString(pathOptions : PathOptions): string {
        return `${this.type} X${this.p2.x} Y${this.p2.y} I${this.center.x - this.p1.x} J${this.center.y - this.p1.y} F${pathOptions.feedrate}`
    }

    createReversePathElement(): PathElement {
        return new Arc(this.type === "G02" ? "G03" : "G02", this.p2, this.p1, this.center);
    }
}