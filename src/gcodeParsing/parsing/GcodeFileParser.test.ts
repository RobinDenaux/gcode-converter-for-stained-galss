import {GcodeFileParser} from "src/gcodeParsing/parsing/GcodeFileParser.ts";
import {Line} from "src/gcodeParsing/pathElements/Line.ts";

describe('GcodeFileParser', () => {
    let parser: GcodeFileParser;

    beforeEach(() => {
        parser = new GcodeFileParser();
    });

    it('parse on line file', () => {
        const file = "G01 X10 Y11 Z12 F13"

        const parsedGcode = parser.parseFile(file);

        expect(parsedGcode.paths.length).toBe(1);
        expect(parsedGcode.paths[0].elements.length).toBe(1);
        expect(parsedGcode.paths[0].elements[0]).toBeInstanceOf(Line);
    })

    it('parse on line file with multiple lines', () => {
        const file = "G01 X10 Y11 Z12 F13\nG01 X20 Y11 Z12 F13\nG01 X30 Y11 Z12 F13"

        const parsedGcode = parser.parseFile(file);

        expect(parsedGcode.paths.length).toBe(1);
        expect(parsedGcode.paths[0].elements.length).toBe(3);
    })
})