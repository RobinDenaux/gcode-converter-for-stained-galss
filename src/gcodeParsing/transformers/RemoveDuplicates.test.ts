import { ParsedGcodeFile } from "../parsing/ParsedGcodeFile.ts";
import { RemoveDuplicates } from "./RemoveDuplicates.ts";
import {Path} from "src/gcodeParsing/pathElements/Path.ts";
import {Line} from "src/gcodeParsing/pathElements/Line.ts";
import {Point} from "src/gcodeParsing/pathElements/Point.ts";
import {Arc} from "src/gcodeParsing/pathElements/Arc.ts";

describe('RemoveDuplicates', () => {
    let removeDuplicates: RemoveDuplicates;
    let gcode: ParsedGcodeFile;
    let path1: Path
    let path2: Path
    const verticalLine = new Line("G01", new Point(0, 0, true), new Point(0, 10, true));
    const horizontalLine = new Line("G01", new Point(0, 0, true), new Point(10, 0, true));
    const arc = new Arc("G02", new Point(0, 0, true), new Point(10, 10, true), new Point(0, 10, true));
    const otherArc = new Arc("G02", new Point(0, 0, true), new Point(20, 20, true), new Point(0, 20, true));

    beforeEach(() => {
        removeDuplicates = new RemoveDuplicates();
        // Initialize gcode with some test data
        gcode = new ParsedGcodeFile();
        path1 = new Path();
        path2 = new Path();
        gcode.paths = [path1, path2];

    });

    test('removes duplicate elements in exact same line', () => {
        path1.elements = [verticalLine];
        path2.elements = [verticalLine];

        const transformedGcode = removeDuplicates.transform(gcode);

        expect(transformedGcode.paths.length).toBe(1);
    });

    test('does not remove different lines', () => {
        path1.elements = [verticalLine];
        path2.elements = [horizontalLine];

        const transformedGcode = removeDuplicates.transform(gcode);

        expect(transformedGcode.paths.length).toBe(2);
    })

    test('removes duplicate arc' , () => {
        path1.elements = [arc];
        path2.elements = [arc];

        const transformedGcode = removeDuplicates.transform(gcode);

        expect(transformedGcode.paths.length).toBe(1);
    })

    test('does not remove different arcs', () => {
        path1.elements = [arc];
        path2.elements = [otherArc];

        const transformedGcode = removeDuplicates.transform(gcode);

        expect(transformedGcode.paths.length).toBe(2);
    })

    test('remove element in complex path', () => {
        path1.elements = [horizontalLine, arc, verticalLine];
        path2.elements = [arc, otherArc];

        const transformedGcode = removeDuplicates.transform(gcode);

        expect(transformedGcode.paths[0].elements.length).toBe(2);
        expect(transformedGcode.paths[1].elements.length).toBe(2);
    })
});