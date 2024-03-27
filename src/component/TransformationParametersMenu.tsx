import styles from "./gcodeEditorStyle.module.css"
import {useEffect} from "react";

type Props = {
    setLoadedGcode: (gcode: string) => void,
    loadedFileName: string,
    transformedGcode: string,
    setLoadedFileName: (fileName: string) => void,
    listOfFilesToDownloadImmediatly: { name: string, content: string}[],
    setListOfFilesToDownloadImmediatly: (files: {name: string, content: string}[]) => void,
    setTransformedGcode: (gcode: string) => void,
    loadedGcode: string,
    setPreviewTime: (time: number) => void
}


export const TransformationParametersMenu = ({setLoadedGcode, loadedFileName, transformedGcode,
                                                 setLoadedFileName, listOfFilesToDownloadImmediatly, setListOfFilesToDownloadImmediatly,
                                                 setTransformedGcode, loadedGcode, setPreviewTime} : Props) => {

    const depth = -0.125
    const clearance = 5
    const speed = 600
    const angleDiffMax = 25

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
        downloadFile(gcode, fileName)
    }

    const loadTestFile = () => {
        setLoadedGcode("G00 Z5.000000\n" +
            "G00 X50 Y70\n" +
            "\n" +
            "G01 Z-0.125000 F100.0(Penetrate)\n" +
            "G02 X90.851258 Y30 Z-0.125000 I-0 J-40 F400.000000\n" /*+
            "G02 X36.086524 Y0.932940 Z-0.125000 I-33.423163 J-4.622930\n" +
            "G01 X1.144854 Y0.932930 Z-0.125000\n" +
            "G01 X1.144864 Y35.874600 Z-0.125000\n" +
            "G01 X36.086534 Y35.874600 Z-0.125000\n" +
            "G00 Z5.000000\n" +
            "\n" +
            "(End cutting path id: rect31542-5-1-43-7)\n" +
            "\n" +
            "\n" +
            "(Start cutting path id: rect31542-5-1-4-3)\n" +
            "(Change tool to Default tool)\n" +
            "\n" +
            "G00 Z5.000000\n" +
            "G00 X36.086534 Y70.816280\n" +
            "\n" +
            "G01 Z-0.125000 F100.0(Penetrate)\n" +
            "G01 X36.086534 Y35.874610 Z-0.125000 F400.000000\n" +
            "G01 X1.144864 Y35.874600 Z-0.125000\n" +
            "G01 X1.144874 Y70.816280 Z-0.125000\n" +
            "G01 X36.086534 Y70.816280 Z-0.125000\n" +
            "G00 Z5.000000\n"*/)
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


        let currentPosition = {x:0, y:0, z:0};
        const listOfCutsToMake = [];
        let resultGcode = "G21 (All units in mm)\n"


        const lines = gcode.split('\n');
        for(const line of lines){
            const split = line.split(' ');
            if(split.length === 0 || !split[0].startsWith('G')){
                continue;
            }

            if(split[0] === "G00"){
                currentPosition = commandToPosition(currentPosition, split)
            } else if(split[0] === "G01") {
                const newPosition = commandToPosition(currentPosition, split)
                if(newPosition.x === currentPosition.x && newPosition.y === currentPosition.y){
                    currentPosition = newPosition
                    continue
                }

                const startAngle = calculateLineAngle(currentPosition, newPosition)
                const endAngle = calculateLineAngle(newPosition, currentPosition)
                const cut = {type: split[0], from: currentPosition, to: newPosition, angle: startAngle, endAngle: (endAngle+180)%360, linkedTo: {}}
                const reverseCut = {type: split[0], from: newPosition, to: currentPosition, angle: endAngle, endAngle: (startAngle+180)%360, linkedTo: {}}
                cut.linkedTo = reverseCut
                reverseCut.linkedTo = cut

                console.log(cut)
                console.log(distanceBetween(cut.from, cut.to))

                if(distanceBetween(cut.from, cut.to) > 2 && listOfCutsToMake.find(existingCut =>
                    existingCut.type === cut.type && distanceBetween(cut.from, existingCut.from) < 1 && distanceBetween(cut.to, existingCut.to) < 1) === undefined){

                    listOfCutsToMake.push(cut)
                    listOfCutsToMake.push(reverseCut)
                }

                currentPosition = newPosition
            } else if(split[0] === "G02") {
                const newPosition = commandToPosition(currentPosition, split)

                const startAngle = calculateArcAngle(currentPosition, newPosition)
                const endAngle = calculateReverseArcAngle(newPosition, {i: currentPosition.x + parseFloat(newPosition.i) - parseFloat(newPosition.x), j: currentPosition.y + parseFloat(newPosition.j) - parseFloat(newPosition.y)})
                const cut = {type: split[0], from: currentPosition, to: newPosition, center: {i: currentPosition.x + parseFloat(newPosition.i), j: currentPosition.y + newPosition.j}, angle: startAngle, endAngle: (endAngle+180)%360, linkedTo: {}}
                const reverseCut = {type: "G03", from: newPosition, to: currentPosition, center: {i: currentPosition.x + parseFloat(newPosition.i), j: currentPosition.y + newPosition.j}, angle: endAngle, endAngle: (startAngle+180)%360, linkedTo: {}}
                cut.linkedTo = reverseCut
                reverseCut.linkedTo = cut
                console.log(cut)
                listOfCutsToMake.push(cut)
                listOfCutsToMake.push(reverseCut)


                currentPosition = newPosition

            } else if(split[0] === "G03") {
                const newPosition = commandToPosition(currentPosition, split)

                const startAngle = calculateReverseArcAngle(currentPosition, newPosition)
                const endAngle = calculateArcAngle(newPosition, {i: currentPosition.x + newPosition.i - newPosition.x, j: currentPosition.y + newPosition.j - parseFloat(newPosition.y)})
                const cut = {type: split[0], from: currentPosition, to: newPosition, center: {i: currentPosition.x + newPosition.i, j: currentPosition.y + newPosition.j}, angle: startAngle, endAngle: (endAngle+180)%360, linkedTo: {}}
                const reverseCut = {type: "G02", from: newPosition, to: currentPosition, center: {i: currentPosition.x + newPosition.i, j: currentPosition.y + newPosition.j}, angle: endAngle, endAngle: (startAngle+180)%360, linkedTo: {}}
                cut.linkedTo = reverseCut
                reverseCut.linkedTo = cut
                console.log(cut)
                listOfCutsToMake.push(cut)
                listOfCutsToMake.push(reverseCut)


                currentPosition = newPosition

            }
            //console.log(split);

        }

        console.log(listOfCutsToMake)
        let currentAngle = 0
        while(listOfCutsToMake.length > 0){
            //listOfCutsToMake.sort((a, b) => Math.sqrt(Math.pow(a.from.x, 2) + Math.pow(a.from.y, 2)) - Math.sqrt(Math.pow(b.from.x, 2) + Math.pow(b.from.y, 2)))
            listOfCutsToMake.sort((a, b) => distanceBetween(b.from, b.to) - distanceBetween(a.from, a.to))
            let currentCut = listOfCutsToMake.find(a => distanceBetween(a.from, a.to) > 1)
            if(!currentCut){
                break
            }
            let betterStartingCut = currentCut
            do {
                let cutBefore = listOfCutsToMake.find(o => o !== betterStartingCut && (Math.abs(betterStartingCut.angle - o.endAngle) < (distanceBetween(o.from, o.to) < 1 ? 60 : angleDiffMax)) && distanceBetween(betterStartingCut.from, o.to) < 0.001)
                if(cutBefore){
                    betterStartingCut = cutBefore
                } else {
                    break
                }
            } while(true)
            if(distanceBetween(currentCut.to, betterStartingCut.from) < 1){
                break;
            }
            currentCut = betterStartingCut
            console.log(currentCut)
            resultGcode += "\n(Start cutting angle "+currentCut.angle+")\n"

            if(Math.min((currentCut.angle - currentAngle + 360*2) % 360, 360 - (currentCut.angle - currentAngle + 360*2) % 360) > 100) {
                let intermediateAngle = (currentCut.angle + currentAngle) / 2
                resultGcode += "G00 Z"+clearance+"\n"
                let cutterPositioningPosition = cutterPositioningPositionForAngle(intermediateAngle+180)
                resultGcode += "G00 X" + cutterPositioningPosition.x + " Y" + cutterPositioningPosition.y + "\n"
                resultGcode += "G01 Z"+depth+" F100(Penetrate)\n"
                cutterPositioningPosition = cutterPositioningPositionForAngle(intermediateAngle)
                resultGcode += "G01 X" + cutterPositioningPosition.x + " Y" + cutterPositioningPosition.y + " Z"+depth+" F"+speed+"\n"
            }

            resultGcode += "G00 Z"+clearance+"\n"
            let cutterPositioningPosition = cutterPositioningPositionForAngle(currentCut.angle+180)
            resultGcode += "G00 X" + cutterPositioningPosition.x + " Y" + cutterPositioningPosition.y + "\n"
            resultGcode += "G01 Z"+depth+" F100(Penetrate)\n"
            cutterPositioningPosition = cutterPositioningPositionForAngle(currentCut.angle)
            resultGcode += "G01 X" + cutterPositioningPosition.x + " Y" + cutterPositioningPosition.y + " Z"+depth+" F"+speed+"\n"

            resultGcode += "G00 Z"+clearance+"\n"
            resultGcode += "G00 X" + currentCut.from.x + " Y" + currentCut.from.y + "\n"
            resultGcode += "G01 Z"+depth+" F100(Penetrate)\n"
            resultGcode += cutToGcodeString(currentCut)
            listOfCutsToMake.splice(listOfCutsToMake.indexOf(currentCut), 1)
            listOfCutsToMake.splice(listOfCutsToMake.indexOf(currentCut.linkedTo), 1)

            while(currentCut){
                let lastCut = currentCut
                currentCut = selectCutThatMatchEndAngle(currentCut, listOfCutsToMake)
                console.log(currentCut)
                if(!currentCut){
                    break
                }

                if(distanceBetween(currentCut.from, lastCut.to) > 0.1){

                    let betterStartingCut = currentCut
                    let it = 0
                    do {
                        const cutBefore = listOfCutsToMake.find(o => o !== betterStartingCut && (Math.abs(betterStartingCut.angle - o.endAngle) < (distanceBetween(o.from, o.to) < 1 ? 60 : angleDiffMax)) && distanceBetween(betterStartingCut.from, o.to) < 0.001)
                        if(cutBefore){
                            betterStartingCut = cutBefore
                        } else {
                            break
                        }
                        it++
                    } while(it < 100)
                    if(distanceBetween(currentCut.to, betterStartingCut.from) < 1){
                        break;
                    }
                    if(Math.abs(currentCut.angle - lastCut.endAngle) > angleDiffMax){
                        break;
                    }
                    currentCut = betterStartingCut


                    resultGcode += "G00 Z"+clearance+"\n"
                    resultGcode += "G00 X" + currentCut.from.x + " Y" + currentCut.from.y + "\n"
                    resultGcode += "G01 Z"+depth+" F100(Penetrate)\n"
                } else {
                    currentCut.from = lastCut.to
                }
                resultGcode += cutToGcodeString(currentCut)
                listOfCutsToMake.splice(listOfCutsToMake.indexOf(currentCut), 1)
                listOfCutsToMake.splice(listOfCutsToMake.indexOf(currentCut.linkedTo), 1)
            }
        }

        resultGcode += "G00 Z30\n" +
            "G00 X0 Y0\n" +
            "M2\n"
        console.log(resultGcode)
        setTransformedGcode(resultGcode)
        return resultGcode
    }

    function distanceBetween(a, b){
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
    }

    function calculateArcAngle(from, center){
        return ((Math.round((Math.atan2(center.j, center.i) * 180 / Math.PI) * 10000) / 10000)+360+90) % 360
    }

    function calculateReverseArcAngle(from, center){
        return ((Math.round((Math.atan2(center.j, center.i) * 180 / Math.PI) * 10000) / 10000)+360-90) % 360
    }

    function cutToGcodeString(cut){
        return cut.type+" X" + cut.to.x + " Y" + cut.to.y + (!!cut.center ? " I"+(parseFloat(cut.center.i) - parseFloat(cut.from.x)) + " J"+(parseFloat(cut.center.j) - parseFloat(cut.from.y)) : "") + " Z"+depth+" F"+speed+"\n"
    }

    function cutterPositioningPositionForAngle(angle){
        return {x: 2.5+Math.round(Math.cos(angle / 180 * Math.PI)*2.5*10000)/10000, y: 2.5+Math.round(Math.sin(angle / 180 * Math.PI)*2.5*10000)/10000}
    }

    function selectCutThatMatchEndAngle(cut, listOfCutsToMake){
        listOfCutsToMake.sort((a, b) => distanceBetween(a.from, cut.to) - distanceBetween(b.from, cut.to))
        return listOfCutsToMake.find(o => Math.abs(cut.endAngle - o.angle) < 2*angleDiffMax || (distanceBetween(cut.to, o.from) < 0.001 && distanceBetween(o.from, o.to) < 1))
    }

    function calculateLineAngle(from, to){
        return ((Math.round((Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI) * 10000) / 10000)+360) % 360
    }

    function commandToPosition(from, commandArguments){
        var newPosition = {x: from.x, y: from.y, z: from.z, i: undefined, j: undefined}

        for(var arg of commandArguments){
            if(arg.startsWith('X')){
                newPosition.x = Math.round(parseFloat(arg.substring(1)) * 10000) / 10000
            } else if(arg.startsWith('Y')){
                newPosition.y = Math.round(parseFloat(arg.substring(1)) * 10000) / 10000
            } else if(arg.startsWith('Z')){
                newPosition.z = Math.round(parseFloat(arg.substring(1)) * 10000) / 10000
            } else if(arg.startsWith('I')){
                newPosition.i = Math.round(parseFloat(arg.substring(1)) * 10000) / 10000
            } else if(arg.startsWith('J')){
                newPosition.j = Math.round(parseFloat(arg.substring(1)) * 10000) / 10000
            } else if(arg.startsWith('R')){
                let r = parseFloat(arg.substring(1))
                let alpha = Math.acos(distanceBetween(from, newPosition) / (2 * r))
                let beta = Math.atan2(newPosition.x - from.x, newPosition.y - from.y)
                let gamma = alpha - beta
                newPosition.j = r * Math.cos(gamma)
                newPosition.i = r * Math.sin(gamma)
            }
        }

        return newPosition
    }

    useEffect(() => {
        transformGcode(loadedGcode)
    }, [loadedGcode])

    return (
        <div className={styles.mainColumn+" "+styles.menuPanel}>
            <div>
                <strong>File : </strong>{loadedFileName}
            </div>
            <div className={styles.buttonGroup}>
                <button onClick={loadTestFile}>Load test file</button>
                <button disabled={!loadedFileName} onClick={() => downloadFile(transformedGcode, loadedFileName)}>Save transformed file</button>
                <button disabled={!loadedFileName} onClick={() => setPreviewTime(0)}>Animate path</button>
            </div>
        </div>
    );
};
