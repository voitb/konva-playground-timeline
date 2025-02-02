import React, { useRef, useEffect, useState } from "react";
import Konva from "konva";

const WaveformGenerator = ({ layer }) => {
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

			// Create an offscreen canvas to draw the waveform
			const offscreenCanvas = document.createElement("canvas");
			offscreenCanvas.width = 600; // You can adjust the width
			offscreenCanvas.height = 200; // You can adjust the height
			const offscreenCtx = offscreenCanvas.getContext("2d");

			// Draw the waveform on the offscreen canvas
			offscreenCtx.clearRect(
				0,
				0,
				offscreenCanvas.width,
				offscreenCanvas.height
			);
			offscreenCtx.fillStyle = "rgb(200, 200, 200)";
			offscreenCtx.fillRect(
				0,
				0,
				offscreenCanvas.width,
				offscreenCanvas.height
			);
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

			waveformImg.onload = function () {
				const spriteHeight = waveformImg.height;

				const image = new Konva.Image({
					image: waveformImg,
					x: 100, // Initial x position
					y: 100, // Initial y position
					width: waveformImg.width,
					height: spriteHeight,
					crop: {
						x: 0,
						y: 0,
						width: waveformImg.width,
						height: spriteHeight,
					},
					draggable: true,
					dragBoundFunc: function (pos) {
						// Restrict movement within the canvas
						const newX = Math.max(
							0,
							Math.min(layer.getStage().width() - image.width(), pos.x)
						);
						const newY = Math.max(
							0,
							Math.min(layer.getStage().height() - image.height(), pos.y)
						);
						return {
							x: newX,
							y: newY,
						};
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

				// Add hover effect
				image.on("mouseover", function () {
					image.stroke("red");
					image.strokeWidth(5);
					layer.draw();
				});

				image.on("mouseout", function () {
					image.stroke(null);
					image.strokeWidth(0);
					layer.draw();
				});

				// Bring to top on drag
				image.on("dragstart", function () {
					image.moveToTop();
					anchorRight.moveToTop();
					anchorLeft.moveToTop();
					layer.draw();
				});

				image.on("dragmove", function () {
					updateAnchors();
					layer.draw();
				});

				image.on("dragend", function () {
					updateAnchors();
					layer.draw();
				});

				const anchorRight = new Konva.Rect({
					x: image.x() + image.width() - 10,
					y: image.y(),
					width: 10,
					height: spriteHeight,
					fill: "red",
					opacity: 0.5,
					draggable: true,
					dragBoundFunc: function (pos) {
						image.moveToTop();
						anchorRight.moveToTop();
						anchorLeft.moveToTop();

						const maxWidth = image.attrs.image.width; // Get the original width of the image
						const newWidth =
							maxWidth < pos.x - image.x() ? maxWidth : pos.x - image.x(); // Calculate new width
						const newX = Math.min(pos.x, image.x() + maxWidth);

						console.log(newX, newWidth);

						if (newWidth < 30) return { x: image.x() + 30, y: this.y() }; // Prevent shrinking below 30px

						image.width(newWidth);
						image.crop({
							x: image.crop().x,
							y: 0,
							width: newWidth,
							height: spriteHeight,
						});
						updateAnchors();
						layer.draw();
						return {
							x: newX,
							y: this.y(), // Constrain vertical movement
						};
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
					dragBoundFunc: function (pos) {
						image.moveToTop();
						anchorLeft.moveToTop();
						anchorRight.moveToTop();

						// Calculate new width based on the left anchor's new position
						const newWidth = image.width() + (image.x() - pos.x);
						const newX = Math.max(0, pos.x);

						// Prevent expanding the image beyond its initial dimensions
						if (newX >= image.x() + image.width()) {
							return { x: image.x(), y: this.y() };
						}

						// Prevent shrinking below 30px
						if (newWidth < 30) {
							return { x: image.x() + image.width() - 30, y: this.y() };
						}

						const newCropX = pos.x - image.x() + image.crop().x;

						// Ensure the new crop x does not exceed the initial width of the image
						if (newCropX < 0) {
							return { x: image.x(), y: this.y() };
						}

						// Update the image's width and crop settings
						image.width(newWidth);
						image.crop({
							x: newCropX,
							y: 0,
							width: newWidth,
							height: spriteHeight,
						});

						image.x(pos.x);
						updateAnchors();
						layer.draw();

						return {
							x: pos.x,
							y: this.y(), // Constrain vertical movement
						};
					},
				});

				layer.add(image);
				layer.add(anchorRight);
				layer.add(anchorLeft);
				layer.draw();
			};
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
		</div>
	);
};

const KonvaC = () => {
	const containerRef = useRef(null);
	const [layer, setLayer] = useState(null);

	useEffect(() => {
		const stage = new Konva.Stage({
			container: containerRef.current,
			width: window.innerWidth,
			height: window.innerHeight,
		});

		const newLayer = new Konva.Layer();
		setLayer(newLayer);
		stage.add(newLayer);

		const images = [
			"https://d2ndi552mc32nx.cloudfront.net/b/0ec3c2d1aab4d6a1ec44d2d56f374162/Sprite/s_0.jpg",
			"https://d2ndi552mc32nx.cloudfront.net/b/0ec3c2d1aab4d6a1ec44d2d56f374162/Sprite/s_0.jpg",
		];

		const snapIndicator = new Konva.Rect({
			stroke: "blue",
			strokeWidth: 2,
			dash: [4, 4],
			visible: false,
		});
		newLayer.add(snapIndicator);

		images.forEach((src, index) => {
			const img = new window.Image();
			img.onload = function () {
				const spriteHeight = img.height;

				const image = new Konva.Image({
					image: img,
					x: 50 * index, // Adjust X position for overlap
					y: 0,
					width: 300,
					height: spriteHeight,
					crop: {
						x: 0,
						y: 0,
						width: 300,
						height: spriteHeight,
					},
					draggable: true,
					dragBoundFunc: function (pos) {
						// Restrict movement within the canvas
						const newX = Math.max(
							0,
							Math.min(stage.width() - image.width(), pos.x)
						);
						const newY = Math.max(
							0,
							Math.min(stage.height() - image.height(), pos.y)
						);
						return {
							x: newX,
							y: newY,
						};
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

				// Add hover effect
				image.on("mouseover", function () {
					image.stroke("red");
					image.strokeWidth(5);
					newLayer.draw();
				});

				image.on("mouseout", function () {
					image.stroke(null);
					image.strokeWidth(0);
					newLayer.draw();
				});

				// Bring to top on drag
				image.on("dragstart", function () {
					image.moveToTop();
					anchorRight.moveToTop();
					anchorLeft.moveToTop();
					newLayer.draw();
				});

				image.on("dragmove", function () {
					updateAnchors();
					newLayer.draw();

					// Update snap indicator position
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
					newLayer.batchDraw();
				});

				image.on("dragend", function () {
					// Snap to the closest row based on sprite height
					const y = image.y();
					const closestRow = Math.round(y / spriteHeight) * spriteHeight;
					image.y(closestRow);
					updateAnchors();
					newLayer.draw();

					// Hide snap indicator
					snapIndicator.visible(false);
					newLayer.batchDraw();
				});

				const anchorRight = new Konva.Rect({
					x: 50 * index + 300 - 10,
					y: 0,
					width: 10,
					height: spriteHeight,
					fill: "red",
					opacity: 0.5,
					draggable: true,
					dragBoundFunc: function (pos) {
						image.moveToTop();
						anchorRight.moveToTop();
						anchorLeft.moveToTop();

						const maxWidth = image.attrs.image.width; // Get the original width of the image
						const newWidth =
							maxWidth < pos.x - image.x() ? maxWidth : pos.x - image.x(); // Calculate new width
						const newX = Math.min(pos.x, image.x() + maxWidth) - 10;

						if (newWidth < 30) return { x: image.x() + 20, y: this.y() }; // Prevent shrinking below 30px

						image.width(newWidth);
						image.crop({
							x: image.crop().x,
							y: 0,
							width: newWidth,
							height: spriteHeight,
						});
						updateAnchors();
						newLayer.draw();
						return {
							x: newX,
							y: this.y(), // Constrain vertical movement
						};
					},
				});

				const anchorLeft = new Konva.Rect({
					x: 50 * index,
					y: 0,
					width: 10,
					height: spriteHeight,
					fill: "red",
					opacity: 0.5,
					draggable: true,
					dragBoundFunc: function (pos) {
						image.moveToTop();
						anchorLeft.moveToTop();
						anchorRight.moveToTop();

						// Calculate new width based on the left anchor's new position
						const newWidth = image.width() + (image.x() - pos.x);
						const newX = Math.max(0, pos.x);

						// Prevent expanding the image beyond its initial dimensions
						if (newX >= image.x() + image.width()) {
							return { x: image.x(), y: this.y() };
						}

						// Prevent shrinking below 30px
						if (newWidth < 30) {
							return { x: image.x() + image.width() - 30, y: this.y() };
						}

						const newCropX = pos.x - image.x() + image.crop().x;

						// Ensure the new crop x does not exceed the initial width of the image
						if (newCropX < 0) {
							return { x: image.x(), y: this.y() };
						}

						// Update the image's width and crop settings
						image.width(newWidth);
						image.crop({
							x: newCropX,
							y: 0,
							width: newWidth,
							height: spriteHeight,
						});

						image.x(pos.x);
						updateAnchors();
						newLayer.draw();

						return {
							x: pos.x,
							y: this.y(), // Constrain vertical movement
						};
					},
				});

				newLayer.add(image);
				newLayer.add(anchorRight);
				newLayer.add(anchorLeft);
				newLayer.draw();
			};

			img.src = src;
		});
	}, []);

	return (
		<div>
			<div ref={containerRef} id="container" />
			{layer && <WaveformGenerator layer={layer} />}
		</div>
	);
};

export default KonvaC;
