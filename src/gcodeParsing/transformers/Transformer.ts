import {ParsedGcodeFile} from "../parsing/ParsedGcodeFile.ts";

export interface Transformer {

        transform(gcode : ParsedGcodeFile) : ParsedGcodeFile;
}