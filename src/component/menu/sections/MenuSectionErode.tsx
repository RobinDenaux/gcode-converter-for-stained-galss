import styles from "src/component/gcodeEditorStyle.module.css";

export const MenuSectionErode = () => {
    return (

        <div className={styles.menuSection}>
            <div className={styles.menuSectionTitle}>
                Erode pieces
            </div>
            <p>
                Allow solder to flow between the pieces. This needs to be done before export in inkscape.
                <br/><br/>
                Configure the erode distance in Edit &gt; Preferences &gt; Behaviour &gt; Steps.
                <br/><br/>
                Then Path &gt; Inset.
            </p>
        </div>
    );
};