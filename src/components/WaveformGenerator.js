// WaveformGenerator.js

import React from "react";
import { drawWaveform } from "./utils";
import Konva from "konva";

const WaveformGenerator = ({ layer, snapIndicator }) => {
	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file && layer && snapIndicator) {
			const reader = new FileReader();
			reader.onload = (e) => {
				drawWaveform(e.target.result, (waveformImg) => {
					const spriteHeight = waveformImg.height;
					const image = new Konva.Image({
						image: waveformImg,
						x: 100,
						y: 100,
						width: waveformImg.width,
						height: spriteHeight,
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
							const maxWidth = waveformImg.width;
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
				});
			};
			reader.readAsArrayBuffer(file);
		}
	};

	const handleUrlChange = async (event) => {
		const url = event.target.value;
		if (url && layer && snapIndicator) {
			try {
				const response = await fetch(url);
				const arrayBuffer = await response.arrayBuffer();
				drawWaveform(arrayBuffer, (waveformImg) => {
					const spriteHeight = waveformImg.height;
					const image = new Konva.Image({
						image: waveformImg,
						x: 100,
						y: 100,
						width: waveformImg.width,
						height: spriteHeight,
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
							const maxWidth = waveformImg.width;
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
				});
			} catch (error) {
				console.error("Error fetching the audio file:", error);
			}
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

export default WaveformGenerator;
