import React, { useRef, useEffect, useState } from "react";

const Waveform = () => {
	const canvasRef = useRef(null);
	const [audioContext, setAudioContext] = useState(null);
	const [analyser, setAnalyser] = useState(null);
	const [audioUrl, setAudioUrl] = useState("");
	const audioRef = useRef(new Audio());

	useEffect(() => {
		if (audioUrl) {
			const context = new (window.AudioContext || window.webkitAudioContext)();
			const analyserNode = context.createAnalyser();
			setAudioContext(context);
			setAnalyser(analyserNode);

			const audio = audioRef.current;
			audio.src = audioUrl;
			const source = context.createMediaElementSource(audio);
			source.connect(analyserNode);
			analyserNode.connect(context.destination);

			audio.play();

			return () => {
				audio.pause();
				context.close();
			};
		}
	}, [audioUrl]);

	useEffect(() => {
		if (analyser && canvasRef.current) {
			analyser.fftSize = 2048;
			const bufferLength = analyser.frequencyBinCount;
			const dataArray = new Uint8Array(bufferLength);
			const canvas = canvasRef.current;
			const canvasCtx = canvas.getContext("2d");

			const draw = () => {
				requestAnimationFrame(draw);

				analyser.getByteTimeDomainData(dataArray);

				canvasCtx.fillStyle = "rgb(200, 200, 200)";
				canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

				canvasCtx.lineWidth = 2;
				canvasCtx.strokeStyle = "rgb(0, 0, 0)";

				canvasCtx.beginPath();

				const sliceWidth = (canvas.width * 1.0) / bufferLength;
				let x = 0;

				for (let i = 0; i < bufferLength; i++) {
					const v = dataArray[i] / 128.0;
					const y = (v * canvas.height) / 2;

					if (i === 0) {
						canvasCtx.moveTo(x, y);
					} else {
						canvasCtx.lineTo(x, y);
					}

					x += sliceWidth;
				}

				canvasCtx.lineTo(canvas.width, canvas.height / 2);
				canvasCtx.stroke();
			};

			draw();
		}
	}, [analyser]);

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setAudioUrl(objectUrl);
		}
	};

	const handleUrlChange = (event) => {
		setAudioUrl(event.target.value);
	};

	return (
		<div>
			<h1>Audio Waveform</h1>
			<input
				type="text"
				placeholder="Enter audio URL"
				onChange={handleUrlChange}
			/>
			<input type="file" accept="audio/*" onChange={handleFileChange} />
			<canvas ref={canvasRef} width="600" height="200"></canvas>
		</div>
	);
};

export default Waveform;
