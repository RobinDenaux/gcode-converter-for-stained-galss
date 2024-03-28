import {PathElement} from "./PathElement.ts";
import {Point} from "./Point.ts";

export class Line implements PathElement {

    type : "G00" | "G01";
    p1 : Point;
    p2 : Point;
    angle : number;

    constructor(type : "G00" | "G01", startPoint : Point, endPoint : Point) {
        this.p1 = startPoint;
        this.p2 = endPoint;
        this.type = type;
        this.angle = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
    }
    length() {
        return this.p1.distanceTo(this.p2);
    }
    startAngle() {
        return this.angle
    }
    endAngle() {
        return this.startAngle()
    }

    startPoint(): Point {
        return this.p1;
    }

    endPoint(): Point {
        return this.p2;
    }

    toString(): string {
        return `${this.type} X${this.p2.x} Y${this.p2.y} Z${this.p2.down ? -1 : 5}`;
    }
}