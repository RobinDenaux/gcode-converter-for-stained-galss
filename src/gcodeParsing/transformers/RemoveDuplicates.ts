import {Transformer} from "./Transformer.ts";
import {ParsedGcodeFile} from "../parsing/ParsedGcodeFile.ts";

export class RemoveDuplicates implements Transformer {

    transform(gcode: ParsedGcodeFile): ParsedGcodeFile {
        gcode.paths.forEach((path) => {
            path.elements.forEach((element, index, object) => {
                if(gcode.paths.find((p) => p !== path && p.elements.find(e => element.startPoint.equals(e.startPoint)
                                                                                                        && element.endPoint.equals(e.endPoint)
                                                                                                        && element.type == e.type))) {

                    object.splice(index, 1)
                }
            })
        })

        this.removeEmptyPaths(gcode);

        return gcode
    }

    private removeEmptyPaths(gcode: ParsedGcodeFile) {
        gcode.paths = gcode.paths.filter((path) => path.elements.length > 0)
    }
}