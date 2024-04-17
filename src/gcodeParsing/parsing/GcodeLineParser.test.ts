import GcodeLineParser from "src/gcodeParsing/parsing/GcodeLineParser.ts";

describe('GcodeLineParser', () => {

    it('parse line G01', () => {
        const parsedLine = GcodeLineParser.parseLine("G01 X10 Y11 Z12 F13")

        expect(parsedLine?.type).toBe("G01")
        expect(parsedLine?.x).toBe(10)
        expect(parsedLine?.y).toBe(11)
        expect(parsedLine?.z).toBe(12)
    })

    it('parse arc G02', () => {
        const parsedLine = GcodeLineParser.parseLine("G02 X10 Y11 Z12 I13 J14 F15")

        expect(parsedLine?.type).toBe("G02")
        expect(parsedLine?.x).toBe(10)
        expect(parsedLine?.y).toBe(11)
        expect(parsedLine?.z).toBe(12)
        expect(parsedLine?.i).toBe(13)
        expect(parsedLine?.j).toBe(14)
    })
})