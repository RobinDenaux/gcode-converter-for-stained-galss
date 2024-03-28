import {Transformer} from "./Transformer.ts";
import {ParsedGcodeFile} from "../ParsedGcodeFile.ts";

export class RemoveDuplicates implements Transformer {

    transform(gcode: ParsedGcodeFile): ParsedGcodeFile {
        gcode.paths.forEach((path) => {
            path.elements.forEach((element, index, object) => {
                if(gcode.paths.find((path) => path !== path && path.elements.find(e => element.startPoint().x == e.startPoint().x
                                                                                                        && element.startPoint().y == e.startPoint().y
                                                                                                        && element.endPoint().x == e.endPoint().x
                                                                                                        && element.endPoint().y == e.endPoint().y
                                                                                                        && element.type == e.type))) {
                    object.splice(index, 1)
                }
            })
        })
        return gcode
    }
}