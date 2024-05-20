import React, { useRef, useEffect, useState } from "react";

const WaveformGenerator = () => {
	const canvasRef = useRef(null);
	const [audioData, setAudioData] = useState(null);

	const drawWaveform = (arrayBuffer) => {
		const context = new (window.AudioContext || window.webkitAudioContext)();
		context.decodeAudioData(arrayBuffer, (buffer) => {
			const rawData = buffer.getChannelData(0); // Get the first channel
			const samples = 500; // Number of samples to visualize
			const blockSize = Math.floor(rawData.length / samples); // Number of samples in each block
			const filteredData = [];
			for (let i = 0; i < samples; i++) {
				filteredData.push(rawData[i * blockSize]);
			}
			const normalizedData = filteredData.map(
				(n) => n / Math.max(...filteredData)
			);

			const canvas = canvasRef.current;
			const canvasCtx = canvas.getContext("2d");
			canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

			canvasCtx.fillStyle = "rgb(200, 200, 200)";
			canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

			canvasCtx.lineWidth = 2;
			canvasCtx.strokeStyle = "rgb(0, 0, 0)";
			canvasCtx.beginPath();

			const sliceWidth = canvas.width / samples;
			let x = 0;
			normalizedData.forEach((value, index) => {
				const y = ((1 - value) * canvas.height) / 2;
				if (index === 0) {
					canvasCtx.moveTo(x, y);
				} else {
					canvasCtx.lineTo(x, y);
				}
				x += sliceWidth;
			});
			canvasCtx.lineTo(canvas.width, canvas.height / 2);
			canvasCtx.stroke();
		});
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				drawWaveform(e.target.result);
			};
			reader.readAsArrayBuffer(file);
		}
	};

	const handleUrlChange = async (event) => {
		const url = event.target.value;
		try {
			const response = await fetch(url);
			const arrayBuffer = await response.arrayBuffer();
			drawWaveform(arrayBuffer);
		} catch (error) {
			console.error("Error fetching the audio file:", error);
		}
	};

	return (
		<div>
			<h1>Generate Waveform</h1>
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

export default WaveformGenerator;
