import styles from "src/component/gcodeEditorStyle.module.css"
import {useEffect} from "react";
import testFile from "src/gcodeParsing/testFiles/output_0010.ngc?raw"
import {MenuSectionErode} from "./sections/MenuSectionErode.tsx";
import {MenuSectionPathOptions} from "./sections/MenuSectionPathOptions.tsx";
import {MenuSectionFileSaving} from "./sections/MenuSectionFileSaving.tsx";
import {GcodeToPathsParser} from "src/gcodeParsing/GcodeToPathsParser.ts";
import {PathOptions} from "src/component/GcodeEditor.tsx";

type Props = {
    setLoadedGcode: (gcode: string) => void,
    loadedFileName: string,
    transformedGcode: string,
    setLoadedFileName: (fileName: string) => void,
    listOfFilesToDownloadImmediatly: { name: string, content: string}[],
    setListOfFilesToDownloadImmediatly: (files: {name: string, content: string}[]) => void,
    setTransformedGcode: (gcode: string) => void,
    loadedGcode: string,
    setPreviewTime: (time: number) => void,
    pathOptions: PathOptions
}


export const TransformationParametersMenu = ({setLoadedGcode, loadedFileName, transformedGcode,
                                                 setLoadedFileName, listOfFilesToDownloadImmediatly, setListOfFilesToDownloadImmediatly,
                                                 setTransformedGcode, loadedGcode, setPreviewTime, pathOptions} : Props) => {

    const parser = new GcodeToPathsParser()

    useEffect(() => {
        if(listOfFilesToDownloadImmediatly.length === 0){
            return;
        }

        listOfFilesToDownloadImmediatly.forEach((file) => {
            transformAndDownloadFile(file.content, file.name)
        })

       setListOfFilesToDownloadImmediatly([])
    }, [listOfFilesToDownloadImmediatly.length])

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
        const parsedGcode = parser.parseGcode(gcode, pathOptions).toString(pathOptions) + "G00 Z30\n" +
            "G00 X0 Y0\n" +
            "M2\n"
        console.log({"Parsed gcode" :parsedGcode.toString()})
        return parsedGcode.toString(pathOptions)
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
