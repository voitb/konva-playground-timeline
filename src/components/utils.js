// utils.js

import Konva from "konva";

export const drawWaveform = (arrayBuffer, onLoad) => {
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

		// Create an offscreen canvas to draw the waveform
		const offscreenCanvas = document.createElement("canvas");
		offscreenCanvas.width = 600; // You can adjust the width
		offscreenCanvas.height = 200; // You can adjust the height
		const offscreenCtx = offscreenCanvas.getContext("2d");

		// Draw the waveform on the offscreen canvas
		offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
		offscreenCtx.fillStyle = "rgb(200, 200, 200)";
		offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
		offscreenCtx.lineWidth = 2;
		offscreenCtx.strokeStyle = "rgb(0, 0, 0)";
		offscreenCtx.beginPath();

		const sliceWidth = offscreenCanvas.width / samples;
		let x = 0;
		normalizedData.forEach((value, index) => {
			const y = ((1 - value) * offscreenCanvas.height) / 2;
			if (index === 0) {
				offscreenCtx.moveTo(x, y);
			} else {
				offscreenCtx.lineTo(x, y);
			}
			x += sliceWidth;
		});
		offscreenCtx.lineTo(offscreenCanvas.width, offscreenCanvas.height / 2);
		offscreenCtx.stroke();

		// Convert the offscreen canvas to an image
		const waveformImg = new window.Image();
		waveformImg.src = offscreenCanvas.toDataURL();

		waveformImg.onload = () => onLoad(waveformImg);
	});
};

export const createImageWithAnchors = (
	layer,
	imageSrc,
	initialX,
	initialY,
	snapIndicator
) => {
	const img = new window.Image();
	img.onload = function () {
		const spriteHeight = img.height;
		const image = new Konva.Image({
			image: img,
			x: initialX,
			y: initialY,
			width: 300,
			height: spriteHeight,
			crop: { x: 0, y: 0, width: 300, height: spriteHeight },
			draggable: true,
			dragBoundFunc: (pos) => {
				const stage = layer.getStage();
				const newX = Math.max(
					0,
					Math.min(stage.width() - image.width(), pos.x)
				);
				const newY = Math.max(
					0,
					Math.min(stage.height() - image.height(), pos.y)
				);
				return { x: newX, y: newY };
			},
		});

		const updateAnchors = () => {
			anchorRight.x(image.x() + image.width() - 10);
			anchorRight.y(image.y());
			anchorRight.height(image.height());

			anchorLeft.x(image.x());
			anchorLeft.y(image.y());
			anchorLeft.height(image.height());
		};

		const anchorRight = new Konva.Rect({
			x: image.x() + image.width() - 10,
			y: image.y(),
			width: 10,
			height: spriteHeight,
			fill: "red",
			opacity: 0.5,
			draggable: true,
			dragBoundFunc: (pos) => {
				const maxWidth = img.width;
				const newWidth = Math.min(maxWidth, pos.x - image.x());
				if (newWidth < 30) return { x: image.x() + 30, y: pos.y };

				image.width(newWidth);
				image.crop({ x: 0, y: 0, width: newWidth, height: spriteHeight });
				updateAnchors();
				layer.draw();
				return { x: pos.x, y: pos.y };
			},
		});

		const anchorLeft = new Konva.Rect({
			x: image.x(),
			y: image.y(),
			width: 10,
			height: spriteHeight,
			fill: "red",
			opacity: 0.5,
			draggable: true,
			dragBoundFunc: (pos) => {
				const newWidth = image.width() + (image.x() - pos.x);
				if (newWidth < 30)
					return { x: image.x() + image.width() - 30, y: pos.y };

				image.width(newWidth);
				image.x(pos.x);
				image.crop({
					x: image.x() - pos.x,
					y: 0,
					width: newWidth,
					height: spriteHeight,
				});
				updateAnchors();
				layer.draw();
				return { x: pos.x, y: pos.y };
			},
		});

		image.on("dragmove", function () {
			const y = image.y();
			const closestRow = Math.round(y / spriteHeight) * spriteHeight;
			snapIndicator.position({
				x: image.x(),
				y: closestRow,
			});
			snapIndicator.size({
				width: image.width(),
				height: image.height(),
			});
			snapIndicator.visible(true);
			layer.batchDraw();

			updateAnchors(); // Update anchors during drag
		});

		image.on("dragend", function () {
			const y = image.y();
			const closestRow = Math.round(y / spriteHeight) * spriteHeight;
			image.y(closestRow);
			updateAnchors();
			layer.draw();

			snapIndicator.visible(false);
			layer.batchDraw();
		});

		layer.add(image);
		layer.add(anchorRight);
		layer.add(anchorLeft);
		layer.draw();
	};

	img.src = imageSrc;
};
