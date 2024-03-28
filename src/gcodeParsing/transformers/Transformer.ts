import {ParsedGcodeFile} from "../ParsedGcodeFile.ts";

export interface Transformer {

        transform(gcode : ParsedGcodeFile) : ParsedGcodeFile;
}