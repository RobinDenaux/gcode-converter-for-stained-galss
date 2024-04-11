import {ParsedGcodeFile} from "src/gcodeParsing/ParsedGcodeFile.ts";
import {Transformer} from "src/gcodeParsing/transformers/Transformer.ts";
import {SplitOnToolUp} from "src/gcodeParsing/transformers/SplitOnToolUp.ts";
import {SplitOnSharpAngle} from "src/gcodeParsing/transformers/SplitOnSharpAngle.ts";
import {AddToolTransition} from "src/gcodeParsing/transformers/AddToolTransition.ts";
import {RemoveDuplicates} from "src/gcodeParsing/transformers/RemoveDuplicates.ts";
import {PathOptions} from "src/component/gcodeEditor/GcodeEditor.tsx";
import {GcodeFileParser} from "src/gcodeParsing/parsing/GcodeFileParser.ts";

export class GcodeTransformationStack {

    private transformers : Transformer[] = []
    private toolTransitionTransformer = new AddToolTransition()
    private splitOnSharpAngle = new SplitOnSharpAngle()
    private parser = new GcodeFileParser()

    constructor() {
        this.transformers.push(new RemoveDuplicates())
        this.transformers.push(new SplitOnToolUp());
        this.transformers.push(this.splitOnSharpAngle);
        this.transformers.push(this.toolTransitionTransformer);

    }

    parseGcode(gcode : string, pathOptions : PathOptions): ParsedGcodeFile {
        this.toolTransitionTransformer.toolOrientationChangeAreaPosition = pathOptions.orientationAreaPosition;
        this.toolTransitionTransformer.angularLimit = pathOptions.angularPathLimit
        this.splitOnSharpAngle.angularLimit = pathOptions.angularPathLimit
        let parsedGcode = this.parser.parseFile(gcode);
        for(const transformer of this.transformers) {
            parsedGcode = transformer.transform(parsedGcode);
        }
        return parsedGcode;
    }
}