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

		const snapIndicator = new Konva.Rect({
			stroke: "blue",
			strokeWidth: 2,
			dash: [4, 4],
			visible: false,
		});
		layer.add(snapIndicator);

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
					layer.batchDraw();
				});

				image.on("dragend", function () {
					// Snap to the closest row based on sprite height
					const y = image.y();
					const closestRow = Math.round(y / spriteHeight) * spriteHeight;
					image.y(closestRow);
					updateAnchors();
					layer.draw();

					// Hide snap indicator
					snapIndicator.visible(false);
					layer.batchDraw();
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

						const newWidth = pos.x - image.x(); // Calculate new width
						const maxWidth = image.attrs.image.width; // Get the original width of the image
						const newX = Math.min(pos.x, maxWidth);

						if (newX >= image.attrs.image.width)
							return { x: maxWidth, y: this.y() };
						if (newWidth < 30) return { x: image.x() + 30 - 10, y: this.y() }; // Prevent shrinking below 30px
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
							x: pos.x,
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

			img.src = src;
		});
	}, []);

	return <div ref={containerRef} id="container"></div>;
};

export default KonvaC;
