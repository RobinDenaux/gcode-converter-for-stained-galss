import styles from "./gcodeEditorStyle.module.css";
import {useEffect, useRef} from "react";

type Props = {
    loadedGcode: string,
    transformedGcode: string,
    previewTime: number,
    setPreviewTime: (time: any) => void

}

export const GcodeViewer = ({loadedGcode, transformedGcode, previewTime, setPreviewTime} : Props) => {
    const canvas = useRef<HTMLCanvasElement>(null)
    const error = ""
    let minX = 0, minY = 0, maxX = 0, maxY = 0;
    let canvasWidth = 0;
    let canvasHeight = 0;
    let offsetX = 0, offsetY = 0;
    let scale = 1;


    useEffect(() => {
        redraw()
    }, [loadedGcode, transformedGcode, previewTime])

    useEffect(() => {
        setTimeout(() => {
            if(previewTime < Number.MAX_VALUE - 1000){
                setPreviewTime((t : number) => t + 10000/60)
            }
        }, 1000/60)
    })

    const scaleX = (x: number) : number => {
        return (x - minX) * scale + offsetX
    }

    const scaleY = (y: number) : number => {
        return canvasHeight - ((y - minY) * scale + offsetY)
    }

    const extractAxis = (args: string[], axis: string, current : number | undefined): number | undefined => {
        const find = args.find((arg) => arg.startsWith(axis))
        return find ? parseFloat(find.substring(1)) : current
    }

    const distance = (x1: number, y1: number, x2: number, y2: number) : number => {
        return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2))
    }

    const recalculateLimits = (gcode: string) => {
        let isDown = false;

        gcode.split("\n").forEach((line) => {
            const args = line.split(" ")

            if (args[0] === "G0" || args[0] === "G00" || args[0] === "G1" || args[0] === "G01" || args[0] === "G2" || args[0] === "G02" || args[0] === "G3" || args[0] === "G03") {
                const x = extractAxis(args, 'X', minX)!
                const y = extractAxis(args, 'Y', minY)!
                const z = extractAxis(args, 'Z', 0)!

                isDown = z <= 0;

                if(isDown) {
                    minX = Math.min(minX, x)
                    minY = Math.min(minY, y)
                    maxX = Math.max(maxX, x)
                    maxY = Math.max(maxY, y)
                }
            }
        })
    }

    const redraw = () => {
        if(canvas.current === null){
            return;
        }

        canvas.current.width = canvas.current.clientWidth;
        canvas.current.height = canvas.current.clientHeight;
        canvasWidth = canvas.current.width;
        canvasHeight = canvas.current.height;
        const context = canvas.current.getContext('2d')
        const width = canvas.current.width;
        const height = canvas.current.height;
        if(context === null){
            return;
        }

        let remainingTimeToRender = previewTime;

        const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
            if(remainingTimeToRender <= 0){
                return;
            }
            const progress = Math.min(1, Math.max(0, remainingTimeToRender / (distance(x1, y1, x2, y2) * 10)))
            remainingTimeToRender -= distance(x1, y1, x2, y2) * 10;
            if(remainingTimeToRender <= 0){
                context.lineWidth = 2
            }

            context.beginPath();
            context.moveTo(scaleX(x1), scaleY(y1))
            context.lineTo(scaleX(x1 + (x2 - x1) * progress), scaleY(y1 + (y2 - y1) * progress))
            context.stroke();

        }

        const drawArc = (x1: number, y1: number, x2: number, y2: number, i: number, j: number, anticlockwise: boolean) => {
            const angle1 = -Math.atan2(-j, -i)
            const angle2 = -Math.atan2(y2 - y1 - j, x2- x1 - i)
            let diff1 = ((angle2 + 2*Math.PI)%(2*Math.PI) - (angle1 + 2*Math.PI)%(2*Math.PI))
            let diff2 = angle2 - angle1
            if(remainingTimeToRender <= 0){
                return;
            }
            const progress = Math.min(1, Math.max(0, remainingTimeToRender / (distance(0, 0, i, j) * Math.abs((Math.abs(diff1) < Math.abs(diff2) ? diff1 : diff2)) * 10)))
            remainingTimeToRender -= distance(0, 0, i, j) * Math.abs((Math.abs(diff1) < Math.abs(diff2) ? diff1 : diff2)) * 10;
            if(remainingTimeToRender <= 0){
                context.lineWidth = 2
            }

            /*let newAngle = angle1 + ((angle2 + 2*Math.PI)%(2*Math.PI) - (angle1 + 2*Math.PI)%(2*Math.PI)) * progress
            if(newAngle > Math.PI){
                newAngle -= 2*Math.PI
            }*/
            let newAngle = angle1 + (Math.abs(diff1) < Math.abs(diff2) ? diff1 : diff2) * progress

            context.beginPath()
            context.arc(scaleX(x1 + i), scaleY(y1 + j), distance(0, 0, i, j) * scale, angle1, newAngle, anticlockwise)
            context.stroke();

        }

        const drawGcode = (gcode: string) => {
            let currentX = 0;
            let currentY = 0;
            let currentI : number | undefined = undefined;
            let currentJ : number | undefined = undefined;
            let currentR : number | undefined = undefined;
            let lastX = 0;
            let lastY = 0;

            gcode.split("\n").forEach((line) => {
                const args = line.split(" ")
                lastX = currentX;
                lastY = currentY;

                switch (args[0]) {
                    case "G00":
                    case "G0":
                        context.setLineDash([5, 15])
                        context.strokeStyle = "red";

                        currentX = extractAxis(args, 'X', currentX)!
                        currentY = extractAxis(args, 'Y', currentY)!

                        drawLine(lastX, lastY, currentX, currentY)
                        break;
                    case "G01":
                    case "G1":
                        context.setLineDash([])
                        context.strokeStyle = "black";

                        currentX = extractAxis(args, 'X', currentX)!
                        currentY = extractAxis(args, 'Y', currentY)!

                        drawLine(lastX, lastY, currentX, currentY)
                        break;
                    case "G02":
                    case "G2":
                        context.setLineDash([])
                        context.strokeStyle = "black";

                        currentX = extractAxis(args, 'X', currentX)!
                        currentY = extractAxis(args, 'Y', currentY)!
                        currentI = extractAxis(args, 'I', undefined)
                        currentJ = extractAxis(args, 'J', undefined)
                        currentR = extractAxis(args, 'R', undefined)

                        if(currentI === undefined || currentJ === undefined){
                            if(currentR === undefined){
                                break;
                            }
                            currentI = lastX + currentR
                            currentJ = lastY
                        }


                        drawArc(lastX, lastY, currentX, currentY, currentI, currentJ, false)
                        break;
                    case "G03":
                    case "G3":
                        context.setLineDash([])
                        context.strokeStyle = "black";

                        currentX = extractAxis(args, 'X', currentX)!
                        currentY = extractAxis(args, 'Y', currentY)!
                        currentI = extractAxis(args, 'I', undefined)
                        currentJ = extractAxis(args, 'J', undefined)
                        currentR = extractAxis(args, 'R', undefined)

                        if(currentI === undefined || currentJ === undefined){
                            if(currentR === undefined){
                                break;
                            }
                            currentI = lastX + currentR
                            currentJ = lastY
                        }

                        drawArc(lastX, lastY, currentX, currentY, currentI, currentJ, true)
                        break;
                    default:
                        return;
                }
            })
        }

        maxX = 0
        maxY = 0
        minX = 0
        minY = 0
        recalculateLimits(loadedGcode)
        recalculateLimits(transformedGcode)
        minX -= (maxX - minX) * 0.1
        minY -= (maxY - minY) * 0.1
        maxX += (maxX - minX) * 0.1
        maxY += (maxY - minY) * 0.1

        scale = Math.min(canvasWidth / (maxX - minX), canvasHeight / (maxY - minY))
        offsetX = (canvasWidth - (maxX - minX) * scale) / 2
        offsetY = (canvasHeight - (maxY - minY) * scale) / 2

        context.clearRect(0, 0, width, height);

        context.lineWidth = 3
        context.strokeStyle = "red"
        drawLine(0, 0, 10, 0)

        context.lineWidth = 3
        context.strokeStyle = "green"
        drawLine(0, 0, 0, 10)

        context.lineWidth = 1
        //drawGcode(loadedGcode)
        drawGcode(transformedGcode)

        if(remainingTimeToRender > 0){
            setPreviewTime(Number.MAX_VALUE)
        }
    }

    window.addEventListener('resize', redraw)

    return (
        <div className={styles.gcodeViewerPanel}>
            <p style={{color:'red', margin: 0}}>{error}</p>
            <canvas ref={canvas} style={{height: '100%', width: '100%'}}></canvas>
        </div>
    );
};