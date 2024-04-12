import styles from "src/component/gcodeEditor/gcodeEditorStyle.module.css";
import React, {useEffect, useRef, useState} from "react";
import {PathOptions} from "src/component/gcodeEditor/GcodeEditor.tsx";
import {Point} from "src/gcodeParsing/pathElements/Point.ts";

type Props = {
    loadedGcode: string,
    transformedGcode: string,
    previewTime: number,
    setPreviewTime: React.Dispatch<React.SetStateAction<number>>,
    pathOptions: PathOptions

}

export const GcodeViewer = ({loadedGcode, transformedGcode, previewTime, setPreviewTime, pathOptions} : Props) => {
    const canvas = useRef<HTMLCanvasElement>(null)
    const error = useRef("")
    const minX = useRef(0),
        minY = useRef(0),
        maxX = useRef(0),
        maxY = useRef(0);
    const canvasWidth = useRef(0);
    const canvasHeight = useRef(0);
    const offsetX = useRef(0),
        offsetY = useRef(0);
    const scale = useRef(1);
    const [resized, setResized] = useState(false)



    useEffect(() => {
        redraw()
    }, [loadedGcode, transformedGcode, previewTime, resized])

    useEffect(() => {
        setTimeout(() => {
            if(previewTime < Number.MAX_VALUE - 1000){
                setPreviewTime((t : number) => t + 1000/60)
            }
        }, 1000/60)
    })

    useEffect(() => {
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, []);

    const onResize = () => {
        setResized(resized => !resized)
    }

    const scaleX = (x: number) : number => {
        return (x - minX.current) * scale.current + offsetX.current
    }

    const scaleY = (y: number) : number => {
        return canvasHeight.current - ((y - minY.current) * scale.current + offsetY.current)
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
        maxX.current = 0
        maxY.current = 0
        minX.current = 0
        minY.current = 0

        gcode.split("\n").forEach((line) => {
            const args = line.split(" ")

            if (args[0] === "G0" || args[0] === "G00" || args[0] === "G1" || args[0] === "G01" || args[0] === "G2" || args[0] === "G02" || args[0] === "G3" || args[0] === "G03") {
                const x = extractAxis(args, 'X', minX.current)!
                const y = extractAxis(args, 'Y', minY.current)!
                const z = extractAxis(args, 'Z', 0)!

                isDown = z <= 0;

                if(isDown) {
                    minX.current = Math.min(minX.current, x)
                    minY.current = Math.min(minY.current, y)
                    maxX.current = Math.max(maxX.current, x)
                    maxY.current = Math.max(maxY.current, y)
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
        canvasWidth.current = canvas.current.width;
        canvasHeight.current = canvas.current.height;
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
            const diff1 = ((angle2 + 2*Math.PI)%(2*Math.PI) - (angle1 + 2*Math.PI)%(2*Math.PI))
            const diff2 = angle2 - angle1
            if(remainingTimeToRender <= 0){
                return;
            }
            const progress = Math.min(1, Math.max(0, remainingTimeToRender / (distance(0, 0, i, j) * Math.abs((Math.abs(diff1) < Math.abs(diff2) ? diff1 : diff2)) * 10)))
            remainingTimeToRender -= distance(0, 0, i, j) * Math.abs((Math.abs(diff1) < Math.abs(diff2) ? diff1 : diff2)) * 10;
            if(remainingTimeToRender <= 0){
                context.lineWidth = 2
            }

            const newAngle = angle1 + (Math.abs(diff1) < Math.abs(diff2) ? diff1 : diff2) * progress

            context.beginPath()
            context.arc(scaleX(x1 + i), scaleY(y1 + j), distance(0, 0, i, j) * scale.current, angle1, newAngle, anticlockwise)
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
            let lineColor = "black"
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                lineColor = "white"
            }


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
                        context.strokeStyle = lineColor;

                        currentX = extractAxis(args, 'X', currentX)!
                        currentY = extractAxis(args, 'Y', currentY)!

                        drawLine(lastX, lastY, currentX, currentY)
                        break;
                    case "G02":
                    case "G2":
                        context.setLineDash([])
                        context.strokeStyle = lineColor;

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
                        context.strokeStyle = lineColor;

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

        recalculateLimits(transformedGcode)

        const borderOnX = (maxX.current - minX.current) * 0.1
        const borderOnY = (maxY.current - minY.current) * 0.1

        scale.current = Math.min(canvasWidth.current / (maxX.current - minX.current + 2*borderOnX),
            canvasHeight.current / (maxY.current - minY.current + 2*borderOnY))

        offsetX.current = (canvasWidth.current - (maxX.current - minX.current) * scale.current) / 2
        offsetY.current = (canvasHeight.current - (maxY.current - minY.current) * scale.current) / 2

        context.clearRect(0, 0, width, height);

        context.lineWidth = 3
        context.strokeStyle = "red"
        drawLine(0, 0, 10, 0)

        context.lineWidth = 3
        context.strokeStyle = "green"
        drawLine(0, 0, 0, 10)

        context.lineWidth = 1
        drawGcode(transformedGcode)

        if(remainingTimeToRender > 0){
            setPreviewTime(Number.MAX_VALUE)
        }
    }

    const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if(pathOptions.orientationAreaChangeClicked){
            const rect = canvas.current!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            pathOptions.setOrientationAreaPosition(new Point((x - offsetX.current) / scale.current,
                (canvasHeight.current - y - offsetY.current) / scale.current, true))
            pathOptions.setOrientationAreaChangeClicked(false)
        }
    }

    recalculateLimits(transformedGcode)

    return (
        <div className={styles.gcodeViewerPanel} style={{cursor: pathOptions.orientationAreaChangeClicked ? "pointer" : "default"}}>
            <p style={{color:'red', margin: 0}}>{error.current}</p>
            <canvas ref={canvas} style={{height: '100%', width: '100%', aspectRatio: 1}} onClick={onCanvasClick}></canvas>
            <p className={styles.viewerCoordinatesLimits}>
                x: {minX.current.toFixed(2)}mm .. {maxX.current.toFixed(2)}mm<br/>
                y: {minY.current.toFixed(2)}mm .. {maxY.current.toFixed(2)}mm
            </p>
        </div>
    );
};