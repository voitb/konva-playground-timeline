import React, { useEffect, useRef } from "react";
import Konva from "konva";

const KonvaC = () => {
	const containerRef = useRef(null);

	useEffect(() => {
		if (!containerRef.current) return;
		const stage = new Konva.Stage({
			container: containerRef.current,
			width: window.innerWidth,
			height: window.innerHeight,
		});
		const layer = new Konva.Layer();
		stage.add(layer);
		const images = [
			"https://d2ndi552mc32nx.cloudfront.net/b/0ec3c2d1aab4d6a1ec44d2d56f374162/Sprite/s_0.jpg",
			"https://d2ndi552mc32nx.cloudfront.net/b/0ec3c2d1aab4d6a1ec44d2d56f374162/Sprite/s_0.jpg",
		];

		images.forEach((src, index) => {
			const img = new window.Image();
			img.onload = function () {
				const image = new Konva.Image({
					image: img,
					x: 0,
					y: index * img.height,
					width: 300,
					height: img.height,
					crop: {
						x: 0,
						y: 0,
						width: 300,
						height: img.height,
					},
				});
				const anchorRight = new Konva.Rect({
					x: 300 - 10,
					y: index * img.height,
					width: 10,
					height: img.height,
					fill: "red",
					opacity: 0.5,
					draggable: true,
					dragBoundFunc: function (pos) {
						const newWidth = pos.x - image.x();
						image.width(Math.min(img.width - image.crop().x, newWidth));
						image.crop({
							x: image.crop().x,
							y: 0,
							width: Math.min(img.width - image.crop().x, newWidth),
							height: img.height,
						});
						return {
							x: Math.min(image.x() + image.width(), pos.x),
							y: this.absolutePosition().y,
						};
					},
				});

				const anchorLeft = new Konva.Rect({
					x: 0,
					y: index * img.height,
					width: 10,
					height: img.height,
					fill: "red",
					opacity: 0.5,
					draggable: true,
					dragBoundFunc: function (pos) {
						const newWidth = image.width() + image.x() - pos.x;
						image.width(Math.max(0, newWidth));
						image.crop({
							x: pos.x,
							y: 0,
							width: Math.max(0, newWidth),
							height: img.height,
						});
						image.x(pos.x);
						return {
							x: Math.max(0, Math.min(pos.x, image.x() + image.width() - 10)),
							y: this.absolutePosition().y,
						};
					},
				});

				layer.add(image);
				layer.add(anchorRight);
				layer.add(anchorLeft);
				layer.draw();
			};

			img.src = src;
		});
	}, []);

	return <div ref={containerRef} id="container"></div>;
};

export default KonvaC;
