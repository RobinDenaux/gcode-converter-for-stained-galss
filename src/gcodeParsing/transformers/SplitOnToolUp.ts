import {Transformer} from "./Transformer.ts";
import {ParsedGcodeFile} from "../ParsedGcodeFile.ts";
import {Path} from "../pathElements/Path.ts";

export class SplitOnToolUp implements Transformer {

    transform(gcode : ParsedGcodeFile): ParsedGcodeFile {
        const newList : Path[] = []
        let currentPath = new Path();
        const pushCurrentPath = () => {
            if(currentPath.elements.length > 0) {
                newList.push(currentPath);
                currentPath = new Path();
            }
        }

        gcode.paths.forEach((path) => {
            path.elements.forEach((element) => {
                if(element.endPoint.isUp || element.startPoint.isUp){
                    pushCurrentPath();
                } else {
                    currentPath.elements.push(element);
                }
            })
            pushCurrentPath();

        })
        gcode.paths = newList;
        console.log(`Paths after SplitOnToolUp :`);
        console.log(gcode.paths)
        return gcode;
    }

}