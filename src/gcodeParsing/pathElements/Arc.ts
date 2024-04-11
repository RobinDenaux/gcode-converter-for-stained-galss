import {Point} from "./Point.ts";
import {PathElement} from "./PathElement.ts";
import {PathOptions} from "src/component/gcodeEditor/GcodeEditor.tsx";

export class Arc implements PathElement {

    type : "G02" | "G03";
    center : Point;
    radius : number;
    private readonly _startAngle : number;
    private readonly _endAngle : number;
    endPoint: Point;
    startPoint: Point;

    constructor(type : "G02" | "G03", startPoint : Point, endPoint : Point, center : Point) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.center = center;
        this.type = type;
        this.radius = startPoint.distanceTo(center);
        this._startAngle = Math.atan2(this.startPoint.y - this.center.y, this.startPoint.x - this.center.x) + (this.type === "G02" ? -Math.PI/2 : Math.PI/2);
        this._endAngle = Math.atan2(this.endPoint.y - this.center.y, this.endPoint.x - this.center.x) + (this.type === "G02" ? -Math.PI/2 : Math.PI/2);
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

    toString(pathOptions : PathOptions): string {
        return `${this.type} X${this.endPoint.x} Y${this.endPoint.y} I${this.center.x - this.startPoint.x} J${this.center.y - this.startPoint.y} F${pathOptions.feedrate}`
    }

    createReversePathElement(): PathElement {
        return new Arc(this.type === "G02" ? "G03" : "G02", this.endPoint, this.startPoint, this.center);
    }

}