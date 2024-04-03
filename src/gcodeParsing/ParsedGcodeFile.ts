import {PathElement} from "./pathElements/PathElement.ts";
import {Path} from "./pathElements/Path.ts";
import {Line} from "./pathElements/Line.ts";
import {Point} from "./pathElements/Point.ts";
import {Arc} from "./pathElements/Arc.ts";
import {PathOptions} from "src/component/GcodeEditor.tsx";

export class ParsedGcodeFile {

    paths : Path[] = [];
    private currentPosition : Point = new Point(0, 0, false);

    constructor(gcode : string) {
        const path = new Path();

        gcode.split("\n").forEach((line) => {
            const element = this.parseStringToPathElement(line);
            if(element) {
                path.elements.push(element);
            }
        })

        this.paths.push(path);
    }

    toString(pathOptions : PathOptions) {
        return this.paths.map((path) => path.toString(pathOptions)).join("\n\n");
    }

    private parseStringToPathElement(line: string): PathElement | null {
        const args = line.split(" ");
        const lastPosition = this.currentPosition;
        this.currentPosition = this.parsePositionFromArgs(args, this.currentPosition);
        if(lastPosition.x === this.currentPosition.x && lastPosition.y === this.currentPosition.y) {
            return null;
        }
        switch (args[0]) {
            case "G0":
            case "G00":
                return new Line("G00", lastPosition, this.currentPosition);

            case "G1":
            case "G01":
                return new Line("G01", lastPosition, this.currentPosition);

            case "G2":
            case "G02":
                return new Arc("G02", lastPosition, this.currentPosition, this.parseCenterFromArgs(args, lastPosition, this.currentPosition));

            case "G3":
            case "G03":
                return new Arc("G03", lastPosition, this.currentPosition, this.parseCenterFromArgs(args, lastPosition, this.currentPosition));

            default:
                return null;
        }
    }

    private parsePositionFromArgs(args: string[], defaultPosition : Point): Point {
        const x = args.find((arg) => arg.startsWith("X"))?.substring(1);
        const y = args.find((arg) => arg.startsWith("Y"))?.substring(1);
        const z = args.find((arg) => arg.startsWith("Z"))?.substring(1);
        return new Point(x ? parseFloat(x) : defaultPosition.x, y ? parseFloat(y) : defaultPosition.y, z ? parseFloat(z) <= 0 : defaultPosition.down);
    }

    private parseCenterFromArgs(args: string[], from : Point, to : Point): Point {
        const i = args.find((arg) => arg.startsWith("I"))?.substring(1);
        const j = args.find((arg) => arg.startsWith("J"))?.substring(1);
        const r = args.find((arg) => arg.startsWith("R"))?.substring(1);

        if(i && j) {
            return new Point(parseFloat(i) + from.x, parseFloat(j) + from.y, from.down);
        } else if(r) {
            const parsedR = parseFloat(r);
            const alpha = Math.acos(from.distanceTo(to) / (2 * parsedR))
            const beta = Math.atan2(to.x - from.x, to.y - from.y)
            const gamma = alpha - beta
            return new Point(parsedR * Math.sin(gamma), parsedR * Math.cos(gamma), from.down)
        } else {
            throw new Error("Arcs must be defined by either I and J or R");
        }
    }

}