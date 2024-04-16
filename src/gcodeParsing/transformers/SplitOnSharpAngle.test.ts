import {SplitOnSharpAngle} from "src/gcodeParsing/transformers/SplitOnSharpAngle.ts";
import {ParsedGcodeFile} from "src/gcodeParsing/parsing/ParsedGcodeFile.ts";
import {Path} from "src/gcodeParsing/pathElements/Path.ts";
import {Point} from "src/gcodeParsing/pathElements/Point.ts";
import {Line} from "src/gcodeParsing/pathElements/Line.ts";

describe('SplitOnSharpAngle', () => {
    let splitOnSharpAngle: SplitOnSharpAngle;
    let gcode: ParsedGcodeFile;
    let path : Path;
    const firstLine = new Line("G01", new Point(0, 0, true), new Point(100, 0, true));
    const alignedSecondLine = new Line("G01", new Point(100, 0, true), new Point(200, 0, true));
    const smallAngleSecondLine = new Line("G01", new Point(100, 0, true), new Point(200, 1, true));
    const largeAngleSecondLine = new Line("G01", new Point(100, 0, true), new Point(200, 100, true));

    beforeEach(() => {
        splitOnSharpAngle = new SplitOnSharpAngle();
        splitOnSharpAngle.angularLimit = 10;
        gcode = new ParsedGcodeFile();
        path = new Path();
        gcode.paths = [path];
    });

    it('one path without sharp angle', () => {
        path.elements = [firstLine, alignedSecondLine];

        const transformedGcode = splitOnSharpAngle.transform(gcode);

        expect(transformedGcode.paths.length).toBe(1);
    })

    it('one path with small angle', () => {
        path.elements = [firstLine, smallAngleSecondLine];

        const transformedGcode = splitOnSharpAngle.transform(gcode);

        expect(transformedGcode.paths.length).toBe(1);
    })

    it('one path with sharp angle', () => {
        path.elements = [firstLine, largeAngleSecondLine];

        const transformedGcode = splitOnSharpAngle.transform(gcode);

        expect(transformedGcode.paths.length).toBe(2);
        expect(transformedGcode.paths[0].elements.length).toBe(1);
        expect(transformedGcode.paths[1].elements.length).toBe(1);
    })

    it('one path with sharp angle but angularLimit set to 90', () => {
        splitOnSharpAngle.angularLimit = 90;
        path.elements = [firstLine, largeAngleSecondLine];

        const transformedGcode = splitOnSharpAngle.transform(gcode);

        expect(transformedGcode.paths.length).toBe(1);
        expect(transformedGcode.paths[0].elements.length).toBe(2);
    })

    it('two paths with sharp angle', () => {
        path.elements = [firstLine, largeAngleSecondLine];

        const otherPath = new Path();
        otherPath.elements = [firstLine, largeAngleSecondLine];
        gcode.paths.push(otherPath);

        const transformedGcode = splitOnSharpAngle.transform(gcode);

        expect(transformedGcode.paths.length).toBe(4);
    })
})