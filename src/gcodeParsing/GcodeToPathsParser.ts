import {ParsedGcodeFile} from "./ParsedGcodeFile.ts";
import {Transformer} from "./transformers/Transformer.ts";
import {SplitOnToolUp} from "./transformers/SplitOnToolUp.ts";
import {SplitOnSharpAngle} from "./transformers/SplitOnSharpAngle.ts";
import {AddToolTransition} from "./transformers/AddToolTransition.ts";
import {RemoveDuplicates} from "./transformers/RemoveDuplicates.ts";

export class GcodeToPathsParser {

    private transformers : Transformer[] = []

    constructor() {
        this.transformers.push(new RemoveDuplicates())
        this.transformers.push(new SplitOnToolUp());
        this.transformers.push(new SplitOnSharpAngle());
        this.transformers.push(new AddToolTransition());

    }

    parseGcode(gcode : string): ParsedGcodeFile {
        let parsedGcode = new ParsedGcodeFile(gcode);
        for(const transformer of this.transformers) {
            parsedGcode = transformer.transform(parsedGcode);
        }
        return parsedGcode;
    }
}