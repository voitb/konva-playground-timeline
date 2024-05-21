import Konva from "konva";
import "./App.css";
import KonvaS from "./Konva";
import KonvaOld from "./KonvaOld";
import KonvaWaveform from "./KonvaWaveform";
import Waveform from "./Waveform";
import WaveformGenerator from "./WaveformComplete";
import StageContainer from "./components/StageContainer";
import KonvaWaveformShape from "./KonvaWaveformShape";

function App() {
	return (
		<div className="App">
			{/* <KonvaS /> */}
			{/* <Waveform /> */}
			{/* <WaveformGenerator /> */}
			{/* <KonvaWaveform /> */}
			<KonvaWaveformShape />
			{/* <StageContainer /> */}
			{/* <KonvaOld /> */}
		</div>
	);
}

export default App;
