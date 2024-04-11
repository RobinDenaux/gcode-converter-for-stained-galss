import {PathElement} from "src/gcodeParsing/pathElements/PathElement.ts";
import {Line} from "src/gcodeParsing/pathElements/Line.ts";
import {Arc} from "src/gcodeParsing/pathElements/Arc.ts";
import {Point} from "src/gcodeParsing/pathElements/Point.ts";
import {Path} from "src/gcodeParsing/pathElements/Path.ts";
import {ParsedGcodeFile} from "src/gcodeParsing/parsing/ParsedGcodeFile.ts";
import GcodeLineParser, {ParsedGcodeLine} from "src/gcodeParsing/parsing/GcodeLineParser.ts";

export class GcodeFileParser {

    private currentPosition : Point = new Point(0, 0, false);

    parseFile(file : string) {
        const path = new Path();
        const parsedGcode = new ParsedGcodeFile();

        file.split("\n").forEach((line) => {
            const element = this.parseStringToPathElement(line);
            if(element) {
                path.elements.push(element);
            }
        })

        parsedGcode.paths.push(path);

        return parsedGcode
    }

    private parseStringToPathElement(line: string): PathElement | undefined {
        const args = line.split(" ");
        const parsedArgs = GcodeLineParser.parseLine(line);
        if(parsedArgs === undefined) {
            return undefined;
        }

        const lastPosition = this.currentPosition;
        this.currentPosition = this.parsePositionFromArgs(parsedArgs, this.currentPosition);
        if(lastPosition.equals(this.currentPosition)) {
            return undefined;
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
                return new Arc("G02", lastPosition, this.currentPosition, this.parseCenterFromArgs(parsedArgs, lastPosition, this.currentPosition));

            case "G3":
            case "G03":
                return new Arc("G03", lastPosition, this.currentPosition, this.parseCenterFromArgs(parsedArgs, lastPosition, this.currentPosition));

            default:
                return undefined;
        }
    }

    private parsePositionFromArgs(args: ParsedGcodeLine, defaultPosition : Point): Point {
        return new Point(args.x !== undefined ? args.x : defaultPosition.x,
            args.y !== undefined ? args.y : defaultPosition.y,
            args.z !== undefined ? args.z <= 0 : defaultPosition.isDown);
    }



    private parseCenterFromArgs(args: ParsedGcodeLine, from : Point, to : Point): Point {
        if(args.i !== undefined && args.j !== undefined) {
            return new Point(args.i + from.x, args.j + from.y, from.isDown);
        } else if(args.r !== undefined) {
            const parsedR = args.r
            const alpha = Math.acos(from.distanceTo(to) / (2 * parsedR))
            const beta = Math.atan2(to.x - from.x, to.y - from.y)
            const gamma = alpha - beta
            return new Point(parsedR * Math.sin(gamma), parsedR * Math.cos(gamma), from.isDown)
        } else {
            throw new Error("Arcs must be defined by either I and J or R");
        }
    }
}