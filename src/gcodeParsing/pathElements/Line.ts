import {PathElement} from "./PathElement.ts";
import {Point} from "./Point.ts";
import {PathOptions} from "src/component/gcodeEditor/GcodeEditor.tsx";

export class Line implements PathElement {

    type : "G00" | "G01";
    startPoint : Point;
    endPoint : Point;
    angle : number;

    constructor(type : "G00" | "G01", startPoint : Point, endPoint : Point) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.type = type;
        this.angle = Math.atan2(this.endPoint.y - this.startPoint.y, this.endPoint.x - this.startPoint.x);
    }
    length() {
        return this.startPoint.distanceTo(this.endPoint);
    }
    startAngle() {
        return this.angle
    }
    endAngle() {
        return this.startAngle()
    }

    toString(pathOptions : PathOptions): string {
        let feedrate = pathOptions.feedrate
        if(this.type === "G00") {
            feedrate = 1000
        }
        else if(this.startPoint.isDown !== this.endPoint.isDown) {
            feedrate = 200
        }
        return `${this.type} X${this.endPoint.x} Y${this.endPoint.y} Z${this.endPoint.isDown ? pathOptions.cutZDepth : pathOptions.moveZDepth} F${feedrate}`;
    }

    createReversePathElement(): PathElement {
        return new Line(this.type, this.endPoint, this.startPoint);
    }
}