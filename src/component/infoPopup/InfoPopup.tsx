import styles from "src/component/infoPopup/popupStyle.module.css";
import {useState} from "react";

export const InfoPopup = () => {
    const [open, setOpen] = useState(true)
    if(!open) {
        return null;
    }
    return (
        <>
            <div className={styles.background} onClick={() => setOpen(false)}></div>
            <div className={styles.wrapper}>
                <div className={styles.close} onClick={() => setOpen(false)}>x</div>
                <div className={styles.popup}>
                    <div className={styles.popupContent}>
                        <h3>What is this page ?</h3>
                        <p>
                            This tool is designed to <b>adapt gcode files for a CNC with a glass cutting wheel</b> where the wheel is off axis and cannot make sharp angles.<br/>
                            A small area is sacrificed to allow the wheel to rotate between cuts.
                        </p>
                        <h3>
                            The intended workflow
                        </h3>
                        <p>
                            - Draw your pattern in inkscape.<br/>
                            - Use pathOps extension to remove overlapping paths.<br/>
                            - You may want to use Path &gt; Inset to create a small gap between the pieces.<br/>
                            - Export the selected pieces using the GcodeTools extension.<br/>
                            - Drop the generated file into this tool.<br/>
                        </p>
                        <h3>Getting started</h3>
                        <p>
                            Drag and drop a gcode file into the tool (a .ngc file if using inkscape). The tool will then transform the gcode and display the result.<br/>
                            If you drop multiple files, they'll all be transformed with the current settings and saved directly.
                        </p>
                        <h3>Privacy</h3>
                        <p>
                            This tool works offline, in your browser. <b>Your files are not uploaded</b> to a server. There is no tracking, no cookies.
                        </p>
                        <h3>bug reports & feature requests</h3>
                        <p>
                            See <a href={"https:github.com"}>the github page</a>.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};