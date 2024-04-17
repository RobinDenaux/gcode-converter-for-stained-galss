import {SplitOnToolUp} from "src/gcodeParsing/transformers/SplitOnToolUp.ts";
import {ParsedGcodeFile} from "src/gcodeParsing/parsing/ParsedGcodeFile.ts";
import {Path} from "src/gcodeParsing/pathElements/Path.ts";
import {Point} from "src/gcodeParsing/pathElements/Point.ts";
import {Line} from "src/gcodeParsing/pathElements/Line.ts";

describe('SplitOnToolUp', () => {
    let splitOnToolUp: SplitOnToolUp;
    let gcode: ParsedGcodeFile;
    let path: Path;
    const p1Up = new Point(0, 0, false);
    const p1Down = Point.fromPoint(p1Up, true)
    const p2Up = new Point(0, 10, false);
    const p2Down = Point.fromPoint(p2Up, true);
    //const p3Up = new Point(10, 10, true);
    //const p3Down = Point.fromPoint(p3Up, false);

    beforeEach(() => {
        splitOnToolUp = new SplitOnToolUp();
        gcode = new ParsedGcodeFile();
        path = new Path();
        gcode.paths = [path];
    });

    it('one path without tool up', () => {
        path.elements = [new Line("G00", p1Up, p1Down),
            new Line("G01", p1Down, p2Down)]

        const transformedGcode = splitOnToolUp.transform(gcode);

        expect(transformedGcode.paths.length).toBe(1);
    })

    it('one path with tool up at the end', () => {
        path.elements = [new Line("G00", p1Up, p1Down),
            new Line("G01", p1Down, p2Down),
            new Line("G00", p2Down, p2Up)]

        const transformedGcode = splitOnToolUp.transform(gcode);

        expect(transformedGcode.paths.length).toBe(1);
    })

    it('one path with tool up in the middle', () => {
        path.elements = [new Line("G00", p1Up, p1Down),
            new Line("G01", p1Down, p2Down),
            new Line("G00", p2Down, p2Up),
            new Line("G01", p2Up, p2Down),
            new Line("G00", p2Down, p1Down)]

        const transformedGcode = splitOnToolUp.transform(gcode);

        expect(transformedGcode.paths.length).toBe(2);
    })

    it('two paths with tool up in the middle', () => {
        const path2 = new Path();
        gcode.paths = [path, path2];
        path.elements = [new Line("G00", p1Up, p1Down),
            new Line("G01", p1Down, p2Down),
            new Line("G00", p2Down, p2Up),
            new Line("G01", p2Up, p2Down),
            new Line("G00", p2Down, p1Down)]
        path2.elements = [new Line("G00", p1Up, p1Down),
            new Line("G01", p1Down, p2Down),
            new Line("G00", p2Down, p2Up),
            new Line("G01", p2Up, p2Down),
            new Line("G00", p2Down, p1Down)]

        const transformedGcode = splitOnToolUp.transform(gcode);

        expect(transformedGcode.paths.length).toBe(4);
    })

})