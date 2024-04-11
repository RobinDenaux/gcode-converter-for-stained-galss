import {Path} from "src/gcodeParsing/pathElements/Path.ts";
import {PathOptions} from "src/component/gcodeEditor/GcodeEditor.tsx";

export class ParsedGcodeFile {

    paths : Path[] = [];

    toString(pathOptions : PathOptions) {
        return this.paths.map((path) => path.toString(pathOptions)).join("\n\n");
    }

}