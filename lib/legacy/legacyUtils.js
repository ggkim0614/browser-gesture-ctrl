const FINGER_LOOKUP_INDICES = {
	thumb: [0, 1, 2, 3, 4],
	indexFinger: [0, 5, 6, 7, 8],
	middleFinger: [0, 9, 10, 11, 12],
	ringFinger: [0, 13, 14, 15, 16],
	pinky: [0, 17, 18, 19, 20],
};

export const drawHands = (hands, ctx, showNames = false) => {
	if (hands.length <= 0) {
		return;
	}

	hands.sort((hand1, hand2) => {
		if (hand1.handedness < hand2.handedness) return 1;
		if (hand1.handedness > hand2.handedness) return -1;
		return 0;
	});

	const canvasWidth = ctx.canvas.width;

	for (let i = 0; i < hands.length; i++) {
		ctx.fillStyle = hands[i].handedness === 'Left' ? 'purple' : 'blue';
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 2;

		for (let y = 0; y < hands[i].keypoints.length; y++) {
			const keypoint = hands[i].keypoints[y];
			const flippedX = canvasWidth - keypoint.x; // Flip the x coordinate

			ctx.beginPath();
			ctx.arc(flippedX, keypoint.y, 4, 0, 2 * Math.PI);
			ctx.fill();

			if (showNames) {
				drawInvertedText({ ...keypoint, x: flippedX }, ctx);
			}
		}

		const fingers = Object.keys(FINGER_LOOKUP_INDICES);
		for (let z = 0; z < fingers.length; z++) {
			const finger = fingers[z];
			const points = FINGER_LOOKUP_INDICES[finger].map((idx) => {
				const keypoint = hands[i].keypoints[idx];
				const flippedX = canvasWidth - keypoint.x; // Flip the x coordinate
				return { ...keypoint, x: flippedX };
			});
			drawPath(points, ctx);
		}
	}
};

const drawInvertedText = (keypoint, ctx) => {
	ctx.save();
	ctx.translate(keypoint.x - 10, keypoint.y);
	ctx.rotate(-Math.PI / 1);
	ctx.scale(1, -1);
	ctx.fillText(keypoint.name, 0, 0);
	ctx.restore();
};

const drawPath = (points, ctx, closePath = false) => {
	const region = new Path2D();
	region.moveTo(points[0]?.x, points[0]?.y);
	for (let i = 1; i < points.length; i++) {
		const point = points[i];
		region.lineTo(point?.x, point?.y);
	}

	if (closePath) {
		region.closePath();
	}

	ctx.stroke(region);
};
