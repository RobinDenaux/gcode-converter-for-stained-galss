import './App.css'
import {GcodeEditor} from "./component/gcodeEditor/GcodeEditor.tsx";
import {InfoPopup} from "src/component/infoPopup/InfoPopup.tsx";

function App() {

    return (
        <>
            <InfoPopup/>
            <GcodeEditor/>
        </>
    )
}

export default App
