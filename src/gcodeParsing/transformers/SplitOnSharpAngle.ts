import {ParsedGcodeFile} from "../ParsedGcodeFile.ts";
import {Path} from "../pathElements/Path.ts";
import {Transformer} from "./Transformer.ts";
import {PathElement} from "../pathElements/PathElement.ts";

export class SplitOnSharpAngle implements Transformer {

    private _angularLimit = Math.PI / 8
    public set angularLimit(value : number) {
        this._angularLimit = value / 180 * Math.PI;
    }

    transform(gcode : ParsedGcodeFile): ParsedGcodeFile {
        const newList : Path[] = []
        let currentPath = new Path();
        let lastElement : PathElement | null = null;
        const pushCurrentPath = () => {
            if(currentPath.elements.length > 0) {
                newList.push(currentPath);
                currentPath = new Path();
                lastElement = null;
            }
        }

        gcode.paths.forEach((path) => {
            path.elements.forEach((element) => {
                if(lastElement) {
                    const diff1 = Math.abs(element.startAngle() - lastElement.endAngle());
                    const diff2 = Math.abs((element.startAngle() + 2 * Math.PI) % (2 * Math.PI) - (lastElement.endAngle() + 2 * Math.PI) % (2 * Math.PI));
                    if (Math.min(diff1, diff2) > this._angularLimit) {
                        pushCurrentPath();
                    }
                }
                currentPath.elements.push(element);
                lastElement = element;
            })
            pushCurrentPath();

        })
        gcode.paths = newList;
        console.log(`Paths after SplitOnSharpAngle :`);
        console.log(gcode.paths)
        return gcode;
    }

}