import styles from "src/component/gcodeEditor/gcodeEditorStyle.module.css"

type Props = {
    loadedFileName: string,
    loadTestFile: () => void,
    downloadFile: (content: string, fileName: string) => void,
    transformedGcode: string,
    setPreviewTime: (time: number) => void

}

export const MenuSectionFileSaving = ({loadedFileName, loadTestFile, downloadFile, transformedGcode, setPreviewTime} : Props) => {
    return (
        <div className={styles.menuSection}>
            <div className={styles.menuSectionTitle}>
                Load & Save
            </div>
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