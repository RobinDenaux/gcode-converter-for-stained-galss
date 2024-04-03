import styles from "src/component/gcodeEditorStyle.module.css";
import {PathOptions} from "src/component/GcodeEditor.tsx";

type Props = {
    pathOptions: PathOptions

}

export const MenuSectionPathOptions = ({pathOptions} : Props) => {
    return (
        <div className={styles.menuSection}>
            <div className={styles.menuSectionTitle}>
                Path options
            </div>

            <label>Z move : </label><input value={pathOptions.moveZDepth}
                                           onChange={e => pathOptions.setMoveZDepth(parseFloat(e.target.value) || 0)}
                                           min={3}
                                           style={{width: "50px", borderColor: pathOptions.moveZDepth < 3 ? "red" : ""}}/>mm<br/>

            <label>Z cut : </label><input value={pathOptions.cutZDepth}
                                          onChange={e => pathOptions.setCutZDepth(parseFloat(e.target.value) || 0)}
                                          max={0}
                                          style={{width: "50px", borderColor: pathOptions.cutZDepth > 0 ? "red" : ""}}/>mm<br/>

            <label>Feedrate : </label><input value={pathOptions.feedrate}
                                             min={100}
                                             max={1000}
                                                onChange={e => pathOptions.setFeedrate(Math.max(Math.min(parseFloat(e.target.value) || 0, 1000), 0))}
                                             style={{width: "50px", borderColor: pathOptions.feedrate < 100 ? "red" : ""}}/>mm/mn<br/>

            <label>Angular limit for continuous path : </label><input value={pathOptions.angularPathLimit}
                                                                      defaultValue={0}
                                                                      onChange={e => pathOptions.setAngularPathLimit(parseFloat(e.target.value) || 0)}
                                                                      style={{width: "50px", borderColor: pathOptions.angularPathLimit > 45 ? "red" : ""}}/>°<br/>

            <label>Orientation change area : </label><button onClick={() => pathOptions.setOrientationAreaChangeClicked(!pathOptions.orientationAreaChangeClicked)}
                                                            style={pathOptions.orientationAreaChangeClicked ? {backgroundColor : "lightblue"} : {}}>Select</button><br/>
        </div>
    );
};