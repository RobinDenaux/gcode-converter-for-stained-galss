import {ParsedGcodeFile} from "./ParsedGcodeFile.ts";
import {Transformer} from "./transformers/Transformer.ts";
import {SplitOnToolUp} from "./transformers/SplitOnToolUp.ts";
import {SplitOnSharpAngle} from "./transformers/SplitOnSharpAngle.ts";
import {AddToolTransition} from "./transformers/AddToolTransition.ts";
import {RemoveDuplicates} from "./transformers/RemoveDuplicates.ts";
import {PathOptions} from "src/component/GcodeEditor.tsx";

export class GcodeToPathsParser {

    private transformers : Transformer[] = []
    private toolTransitionTransformer = new AddToolTransition()
    private angularSpliter = new SplitOnSharpAngle()

    constructor() {
        this.transformers.push(new RemoveDuplicates())
        this.transformers.push(new SplitOnToolUp());
        this.transformers.push(this.angularSpliter);
        this.transformers.push(this.toolTransitionTransformer);

    }

    parseGcode(gcode : string, pathOptions : PathOptions): ParsedGcodeFile {
        this.toolTransitionTransformer.toolOrientationChangeAreaPosition = pathOptions.orientationAreaPosition;
        this.toolTransitionTransformer.angularLimit = pathOptions.angularPathLimit
        this.angularSpliter.angularLimit = pathOptions.angularPathLimit
        let parsedGcode = new ParsedGcodeFile(gcode);
        for(const transformer of this.transformers) {
            parsedGcode = transformer.transform(parsedGcode);
        }
        return parsedGcode;
    }
}