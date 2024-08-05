const FINGER_LOOKUP_INDICES = {
	thumb: [0, 1, 2, 3, 4],
	indexFinger: [0, 5, 6, 7, 8],
	middleFinger: [0, 9, 10, 11, 12],
	ringFinger: [0, 13, 14, 15, 16],
	pinky: [0, 17, 18, 19, 20],
};

const calculateDistance = (point1, point2) => {
	return Math.sqrt(
		Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
	);
};

const estimateHandSize = (hand) => {
	const thumbBase = hand.keypoints[1]; // CMC joint of thumb
	const thumbTip = hand.keypoints[4]; // Tip of thumb
	const indexBase = hand.keypoints[5]; // MCP joint of index finger
	const indexTip = hand.keypoints[8]; // Tip of index finger

	const thumbLength = calculateDistance(thumbBase, thumbTip);
	const indexLength = calculateDistance(indexBase, indexTip);

	return thumbLength + indexLength; // Sum of thumb and index finger lengths
};

export const drawHands = (hands, ctx, showNames = false) => {
	const pinchStatus = { left: false, right: false };

	if (hands.length <= 0) {
		return pinchStatus; // Return default status if no hands are detected
	}

	hands.sort((hand1, hand2) => {
		if (hand1.handedness < hand2.handedness) return 1;
		if (hand1.handedness > hand2.handedness) return -1;
		return 0;
	});

	const canvasWidth = ctx.canvas.width;
	const canvasHeight = ctx.canvas.height;

	// Adjust this value to set the pinch sensitivity
	const basePinchThreshold = 20;

	for (let i = 0; i < hands.length; i++) {
		ctx.fillStyle = hands[i].handedness === 'Left' ? 'purple' : 'blue';
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 2;

		const thumbTip = hands[i].keypoints[4];
		const indexTip = hands[i].keypoints[8];

		const flippedThumbX = canvasWidth - thumbTip.x;
		const flippedIndexX = canvasWidth - indexTip.x;

		const baseHandSize = 150; // You may need to adjust this based on your specific setup

		const handSize = estimateHandSize(hands[i]);
		const scaleFactor = handSize / baseHandSize;

		const adaptivePinchThreshold = basePinchThreshold * scaleFactor;

		const distance = calculateDistance(
			{ x: flippedThumbX, y: thumbTip.y },
			{ x: flippedIndexX, y: indexTip.y }
		);

		const isPinching = distance < adaptivePinchThreshold;
		pinchStatus[hands[i].handedness.toLowerCase()] = isPinching;

		for (let y = 0; y < hands[i].keypoints.length; y++) {
			const keypoint = hands[i].keypoints[y];
			const flippedX = canvasWidth - keypoint.x;

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
				const flippedX = canvasWidth - keypoint.x;
				return { ...keypoint, x: flippedX };
			});
			drawPath(points, ctx);
		}

		// Draw a line between thumb tip and index tip
		ctx.beginPath();
		ctx.moveTo(flippedThumbX, thumbTip.y);
		ctx.lineTo(flippedIndexX, indexTip.y);
		ctx.strokeStyle = isPinching ? 'red' : 'green';
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	return pinchStatus;
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
