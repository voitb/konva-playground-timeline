import Konva from "konva";
import "./App.css";
import KonvaS from "./Konva";
import KonvaOld from "./KonvaOld";
import KonvaWaveform from "./KonvaWaveform";
import Waveform from "./Waveform";
import WaveformGenerator from "./WaveformComplete";
import StageContainer from "./components/StageContainer";
import KonvaWaveformShape from "./KonvaWaveformShape";
import KonvaWaveformCliping from "./KonvaWaveformCliping";
import KonvaWaveformReusableClass from "./KonvaWaveformReusableClass";
import KonvaWaveformSnapping from "./KonvaWaveformSnapping";

function App() {
	return (
		<div className="App">
			{/* <KonvaS /> */}
			{/* <Waveform /> */}
			{/* <WaveformGenerator /> */}
			{/* <KonvaWaveform /> */}
			{/* <KonvaWaveformShape /> */}
			{/* <KonvaWaveformCliping /> */}
			{/* <KonvaWaveformReusableClass /> */}
			<KonvaWaveformSnapping />
			{/* <StageContainer /> */}
			{/* <KonvaOld /> */}
		</div>
	);
}

export default App;
