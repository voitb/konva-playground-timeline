import React, { useRef, useEffect, useState } from "react";
import Konva from "konva";

class AnchorHandler {
	constructor(group, width, height, clipWidth, snapHandler) {
		this.width = width;
		this.height = height;
		this.group = group;
		this.clipWidth = clipWidth;
		this.snapHandler = snapHandler;
		this.frame = this.createFrame();
		this.anchorRight = this.createAnchor(clipWidth - 10, 0);
		this.anchorLeft = this.createAnchor(0, 0);

		this.initAnchors();
		this.initSnap();

		this.frame.moveToTop();
		this.anchorRight.moveToTop();
		this.anchorLeft.moveToTop();
	}

	createFrame() {
		const frame = new Konva.Rect({
			stroke: "blue",
			strokeWidth: 2,
			x: 0,
			y: 0,
			width: this.clipWidth,
			height: this.height,
		});
		this.group.add(frame);
		return frame;
	}

	createAnchor(x, y) {
		const anchor = new Konva.Rect({
			x: x,
			y: y,
			width: 10,
			height: 10,
			fill: "red",
			opacity: 0.5,
			draggable: true,
		});
		this.group.add(anchor);
		return anchor;
	}

	initAnchors() {
		this.anchorRight.on("dragmove", () => this.handleRightDrag());
		this.anchorLeft.on("dragmove", () => this.handleLeftDrag());

		this.group.on("mouseover", () => this.frame.stroke("red"));
		this.group.on("mouseout", () => this.frame.stroke("blue"));
		this.group.on("dragstart", () => {
			this.group.moveToTop();
			this.frame.moveToTop();
			this.anchorRight.moveToTop();
			this.anchorLeft.moveToTop();
		});
	}

	initSnap() {
		this.group.on("dragmove", () => {
			this.snapHandler.showSnapIndicator(this.group.y());
		});

		this.group.on("dragend", () => {
			const row = Math.floor(this.group.y() / this.snapHandler.rowHeight);
			this.group.y(row * this.snapHandler.rowHeight);
			this.snapHandler.hideSnapIndicator();
			this.group.getLayer().draw();
		});
	}

	handleRightDrag() {
		this.anchorRight.y(0);
		const maxRightX = this.group.width() - 10;
		if (this.anchorRight.position().x >= maxRightX) {
			this.anchorRight.x(maxRightX);
		}
		if (this.anchorRight.position().x - this.anchorLeft.position().x <= 20) {
			this.anchorRight.x(this.anchorLeft.position().x + 20);
		}
		const newWidth =
			this.anchorRight.position().x + 10 - (this.group.clipX() || 0);
		this.frame.width(newWidth);
		this.group.clip({ width: newWidth });
	}

	handleLeftDrag() {
		this.anchorLeft.y(0);
		if (this.anchorLeft.position().x <= 0) {
			this.anchorLeft.x(0);
		}
		if (this.anchorRight.position().x - this.anchorLeft.position().x <= 20) {
			this.anchorLeft.x(this.anchorRight.position().x - 20);
		}
		const newX = this.anchorLeft.position().x;
		const newWidth = this.anchorRight.position().x + 10 - newX;
		this.frame.x(newX);
		this.frame.width(newWidth);
		this.group.clip({ x: newX, width: newWidth });
	}

	getElements() {
		return {
			frame: this.frame,
			anchorRight: this.anchorRight,
			anchorLeft: this.anchorLeft,
		};
	}
}

class SnapHandler {
	constructor(layer, rowHeight) {
		this.layer = layer;
		this.rowHeight = rowHeight;
		this.snapIndicator = this.createSnapIndicator();
		layer.add(this.snapIndicator);
	}

	createSnapIndicator() {
		return new Konva.Rect({
			stroke: "blue",
			strokeWidth: 2,
			dash: [4, 4],
			visible: false,
		});
	}

	showSnapIndicator(y) {
		const row = Math.floor(y / this.rowHeight);
		const snapY = row * this.rowHeight;
		this.snapIndicator.position({ x: 0, y: snapY });
		this.snapIndicator.size({
			width: this.layer.width(),
			height: this.rowHeight,
		});
		this.snapIndicator.show();
		this.layer.batchDraw();
	}

	hideSnapIndicator() {
		this.snapIndicator.hide();
		this.layer.batchDraw();
	}
}

const WaveformGenerator = ({ layer }) => {
	const drawWaveform = (arrayBuffer) => {
		const context = new (window.AudioContext || window.webkitAudioContext)();

		context.decodeAudioData(arrayBuffer, (buffer) => {
			const rawData = buffer.getChannelData(0);
			const samples = 500;
			const blockSize = Math.floor(rawData.length / samples);
			const filteredData = [];

			for (let i = 0; i < samples; i++) {
				filteredData.push(rawData[i * blockSize]);
			}

			const maxHeight = 200;
			const normalizedData = filteredData.map(
				(n) => n / Math.max(...filteredData)
			);

			const frameWidth = normalizedData.length;
			const waveformGroup = new Konva.Group({
				x: 10,
				y: 10,
				draggable: true,
				width: frameWidth,
				height: maxHeight,
				clip: { x: 0, y: 0, width: frameWidth, height: maxHeight },
			});

			new AnchorHandler(
				waveformGroup,
				waveformGroup.width(),
				waveformGroup.height(),
				waveformGroup.width(),
				new SnapHandler(layer, 200) // assuming row height is 200
			);

			normalizedData.forEach((value, index) => {
				const rectHeight = (value + 1) * (maxHeight / 2);
				const rect = new Konva.Rect({
					x: index,
					y: maxHeight / 2 - rectHeight / 2,
					width: 1,
					height: rectHeight,
					fill: "black",
				});
				waveformGroup.add(rect);
			});

			layer.add(waveformGroup);
			layer.draw();
		});
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => drawWaveform(e.target.result);
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
	const [stage, setStage] = useState(null);

	useEffect(() => {
		const stage = new Konva.Stage({
			container: containerRef.current,
			width: window.innerWidth,
			height: window.innerHeight / 1.5,
		});
		setStage(stage);

		const newLayer = new Konva.Layer();
		setLayer(newLayer);
		stage.add(newLayer);

		const rowHeight = 300; // You can adjust this value
		const snapHandler = new SnapHandler(newLayer, rowHeight);

		const images = [
			"https://d2ndi552mc32nx.cloudfront.net/b/0ec3c2d1aab4d6a1ec44d2d56f374162/Sprite/s_0.jpg",
			"https://d2ndi552mc32nx.cloudfront.net/b/0ec3c2d1aab4d6a1ec44d2d56f374162/Sprite/s_0.jpg",
		];

		images.forEach((src, index) => {
			const img = new window.Image();
			img.onload = function () {
				const spriteHeight = img.height;

				const image = new Konva.Image({
					image: img,
				});

				const imageGroup = new Konva.Group({
					x: 50 * index,
					y: 0,
					draggable: true,
					width: image.width(),
					height: spriteHeight,
					clip: {
						x: 0,
						y: 0,
						width: 300,
						height: spriteHeight,
					},
				});

				imageGroup.add(image);
				new AnchorHandler(
					imageGroup,
					image.width(),
					image.height(),
					300,
					snapHandler
				);

				newLayer.add(imageGroup);
				newLayer.draw();
			};

			img.src = src;
		});
	}, []);

	return (
		<div>
			<div ref={containerRef} id="container" />
			{layer && <WaveformGenerator stage={stage} layer={layer} />}
		</div>
	);
};

export default KonvaC;
