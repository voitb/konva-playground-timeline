// StageContainer.js

import React, { useRef, useEffect, useState } from "react";
import Konva from "konva";
import WaveformGenerator from "./WaveformGenerator";
import { createImageWithAnchors } from "./utils";

const StageContainer = () => {
	const containerRef = useRef(null);
	const [layer, setLayer] = useState(null);
	const [snapIndicator, setSnapIndicator] = useState(null);

	useEffect(() => {
		const stage = new Konva.Stage({
			container: containerRef.current,
			width: window.innerWidth,
			height: window.innerHeight,
		});

		const newLayer = new Konva.Layer();
		stage.add(newLayer);
		setLayer(newLayer);

		const newSnapIndicator = new Konva.Rect({
			stroke: "blue",
			strokeWidth: 2,
			dash: [4, 4],
			visible: false,
		});
		newLayer.add(newSnapIndicator);
		setSnapIndicator(newSnapIndicator);

		const images = [
			"https://d2ndi552mc32nx.cloudfront.net/b/0ec3c2d1aab4d6a1ec44d2d56f374162/Sprite/s_0.jpg",
			"https://d2ndi552mc32nx.cloudfront.net/b/0ec3c2d1aab4d6a1ec44d2d56f374162/Sprite/s_0.jpg",
		];

		images.forEach((src, index) => {
			createImageWithAnchors(newLayer, src, 50 * index, 0, newSnapIndicator);
		});
	}, []);

	return (
		<div>
			<div ref={containerRef} id="container" />
			{layer && snapIndicator && (
				<WaveformGenerator layer={layer} snapIndicator={snapIndicator} />
			)}
		</div>
	);
};

export default StageContainer;
