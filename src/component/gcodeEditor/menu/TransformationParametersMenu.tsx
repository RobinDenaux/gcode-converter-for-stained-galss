import styles from "src/component/gcodeEditor/gcodeEditorStyle.module.css"
import {useEffect} from "react";
import testFile from "src/gcodeParsing/testFiles/output_0010.ngc?raw"
import {MenuSectionErode} from "./sections/MenuSectionErode.tsx";
import {MenuSectionPathOptions} from "./sections/MenuSectionPathOptions.tsx";
import {MenuSectionFileSaving} from "./sections/MenuSectionFileSaving.tsx";
import {GcodeTransformationStack} from "src/gcodeParsing/parsing/GcodeTransformationStack.ts";
import {PathOptions} from "src/component/gcodeEditor/GcodeEditor.tsx";

type Props = {
    setLoadedGcode: (gcode: string) => void,
    loadedFileName: string,
    transformedGcode: string,
    setLoadedFileName: (fileName: string) => void,
    listOfFilesToDownloadImmediately: { name: string, content: string}[],
    setListOfFilesToDownloadImmediately: (files: {name: string, content: string}[]) => void,
    setTransformedGcode: (gcode: string) => void,
    loadedGcode: string,
    setPreviewTime: (time: number) => void,
    pathOptions: PathOptions
}


export const TransformationParametersMenu = ({setLoadedGcode, loadedFileName, transformedGcode,
                                                 setLoadedFileName, listOfFilesToDownloadImmediately, setListOfFilesToDownloadImmediately,
                                                 setTransformedGcode, loadedGcode, setPreviewTime, pathOptions} : Props) => {

    const parser = new GcodeTransformationStack()

    useEffect(() => {
        if(listOfFilesToDownloadImmediately.length === 0){
            return;
        }

        listOfFilesToDownloadImmediately.forEach((file) => {
            transformAndDownloadFile(file.content, file.name)
        })

       setListOfFilesToDownloadImmediately([])
    }, [listOfFilesToDownloadImmediately])

    const transformAndDownloadFile = (gcode: string, fileName: string) => {
        const transformed = transformGcode(gcode)
        downloadFile(transformed, fileName)
    }

    const loadTestFile = () => {
        setLoadedGcode(testFile)
        setLoadedFileName("test.ngc")
    }

    const downloadFile = (content: string, fileName: string) => {
        const link = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        link.href = URL.createObjectURL(file);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    const transformGcode = (gcode : string) : string => {
        const parsedGcode = parser.parseGcode(gcode, pathOptions).toString(pathOptions) + "\n" +
            "G01 Z20 F200\n" +
            "G00 X0 Y0 F1000\n" +
            "M2\n"
        console.log({"Parsed gcode" :parsedGcode.toString()})
        return parsedGcode
    }

    useEffect(() => {
        const parsedGcode =  transformGcode(loadedGcode)
        setTransformedGcode(parsedGcode.toString())
    }, [loadedGcode, pathOptions.orientationAreaPosition, pathOptions.angularPathLimit])

    return (
        <div className={styles.mainColumn+" "+styles.menuPanel}>
            <MenuSectionErode/>
            <MenuSectionPathOptions pathOptions={pathOptions}/>
            <MenuSectionFileSaving downloadFile={downloadFile} loadedFileName={loadedFileName} loadTestFile={loadTestFile} transformedGcode={transformedGcode} setPreviewTime={setPreviewTime}/>
        </div>
    );
};
