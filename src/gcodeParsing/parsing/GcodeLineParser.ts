export interface ParsedGcodeLine {
    type: string;
    x: number | undefined;
    y: number | undefined;
    z: number | undefined;
    i: number | undefined;
    j: number | undefined;
    r: number | undefined;
}

export default {

    parseLine(line: string) : ParsedGcodeLine | undefined {
        const args = line.split(" ");
        if(args[0].match(/^G[0-9]{1,2}$/) === null) {
            return undefined
        }
        return {
            type: args[0],
            x: this.parseNumberFromArgs(args, "X"),
            y: this.parseNumberFromArgs(args, "Y"),
            z: this.parseNumberFromArgs(args, "Z"),
            i: this.parseNumberFromArgs(args, "I"),
            j: this.parseNumberFromArgs(args, "J"),
            r: this.parseNumberFromArgs(args, "R")
        } as ParsedGcodeLine;
    },

    parseNumberFromArgs(args: string[], prefix : string): number | undefined {
        const arg = args.find((arg) => arg.startsWith(prefix));
        if(arg === undefined) {
            return undefined;
        }

        const extractedNumber = parseFloat(arg.substring(1));
        if(Number.isNaN(extractedNumber)) {
            throw new Error(`Could not parse ${prefix} from line ${args.join(" ")}`);
        }

        return extractedNumber;
    }
}