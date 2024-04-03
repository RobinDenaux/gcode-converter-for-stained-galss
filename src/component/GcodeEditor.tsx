import {TransformationParametersMenu} from "./menu/TransformationParametersMenu.tsx";
import {GcodeViewer} from "./GcodeViewer.tsx";
import React, {useState} from "react";
import styles from "./gcodeEditorStyle.module.css";
import {Point} from "src/gcodeParsing/pathElements/Point.ts";

type FileParsed = {name: string, content: string}
type ListOfFiles = FileParsed[]
export type PathOptions = {
    feedrate: number,
    setFeedrate:  React.Dispatch<React.SetStateAction<number>>,
    moveZDepth: number,
    setMoveZDepth:  React.Dispatch<React.SetStateAction<number>>,
    cutZDepth: number,
    setCutZDepth:  React.Dispatch<React.SetStateAction<number>>,
    angularPathLimit: number,
    setAngularPathLimit:  React.Dispatch<React.SetStateAction<number>>,
    orientationAreaPosition: Point,
    setOrientationAreaPosition:  React.Dispatch<React.SetStateAction<Point>>,
    orientationAreaChangeClicked: boolean,
    setOrientationAreaChangeClicked:  React.Dispatch<React.SetStateAction<boolean>>
}

export const GcodeEditor = () => {
    const [loadedFileName, setLoadedFileName] = useState("");
    const [loadedGcode, setLoadedGcode] = useState("");
    const [transformedGcode, setTransformedGcode] = useState("");
    const [listOfFilesToDownloadImmediatly, setListOfFilesToDownloadImmediatly] = useState<ListOfFiles>( [])
    const [previewTime, setPreviewTime] = useState(Number.MAX_VALUE)
    const pathOptions : PathOptions = {} as PathOptions
    [pathOptions.feedrate, pathOptions.setFeedrate] = useState(500);
    [pathOptions.moveZDepth, pathOptions.setMoveZDepth] = useState(5);
    [pathOptions.cutZDepth, pathOptions.setCutZDepth] = useState(0);
    [pathOptions.angularPathLimit, pathOptions.setAngularPathLimit] = useState(15);
    [pathOptions.orientationAreaChangeClicked, pathOptions.setOrientationAreaChangeClicked] = useState(false);
    [pathOptions.orientationAreaPosition, pathOptions.setOrientationAreaPosition] = useState(new Point(2.5, 2.5, true));
    function dropHandler(ev : React.DragEvent<HTMLDivElement>) {
        ev.preventDefault();
        if(!ev.dataTransfer) {
            return;
        }

        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            const items = [...ev.dataTransfer.items]
            parseFiles(items
                .map((item) => item.getAsFile())
                .filter((file) => file !== null) as File[])
        } else {
            parseFiles([...ev.dataTransfer.files])
        }
    }

    const parseFiles = (files: File[]) => {
        files.forEach((file) => {
            readFile(file).then((fileParsed: FileParsed) => {
                if (files.length === 1) {
                    setLoadedGcode(fileParsed.content)
                    setLoadedFileName(fileParsed.name)
                } else {
                    setListOfFilesToDownloadImmediatly([...listOfFilesToDownloadImmediatly, {
                        name: fileParsed.name,
                        content: fileParsed.content
                    }])
                }
            })
        });
    }

    const readFile = async (file: File) => {
        return new Promise<FileParsed>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = function () {
                if (!reader.result || typeof reader.result !== 'string') {
                    reject("Error reading file")
                    return;
                }

                resolve({name: file.name, content: reader.result})

            };
            reader.readAsText(file);
        })
    }


    function dragOverHandler (ev : React.DragEvent<HTMLDivElement>) {
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();
    }

    return (
        <div className={styles.mainGcodeEditorPanel} onDrop={dropHandler} onDragOver={dragOverHandler}>
            <GcodeViewer loadedGcode={loadedGcode}
                         transformedGcode={transformedGcode}
                         previewTime={previewTime}
                         setPreviewTime={setPreviewTime}
                         pathOptions={pathOptions}/>
            <TransformationParametersMenu listOfFilesToDownloadImmediatly={listOfFilesToDownloadImmediatly}
                                          setListOfFilesToDownloadImmediatly={setListOfFilesToDownloadImmediatly}
                                          loadedGcode={loadedGcode}
                                          setLoadedGcode={setLoadedGcode}
                                          loadedFileName={loadedFileName}
                                          setLoadedFileName={setLoadedFileName}
                                          transformedGcode={transformedGcode}
                                          setTransformedGcode={setTransformedGcode}
                                          setPreviewTime={setPreviewTime}
                                          pathOptions={pathOptions}/>
        </div>
    );
};