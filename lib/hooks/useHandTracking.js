// useHandTracking.js
import { useState, useEffect, useRef } from 'react';
import { useAnimationFrame } from './useAnimationFrame';
import { drawHands } from '../utils';

export function useHandTracking() {
	const [hands, setHands] = useState({ left: null, right: null });
	const [pinchState, setPinchState] = useState({ left: false, right: false });
	const detectorRef = useRef();
	const videoRef = useRef();
	const ctxRef = useRef();

	useEffect(() => {
		async function initialize() {
			videoRef.current = await setupVideo();
			ctxRef.current = await setupCanvas(videoRef.current);
			detectorRef.current = await setupDetector();
		}

		initialize();
	}, []);

	useAnimationFrame(async () => {
		if (!detectorRef.current || !videoRef.current || !ctxRef.current) return;

		const detectedHands = await detectorRef.current.estimateHands(
			videoRef.current,
			{
				flipHorizontal: true,
			}
		);

		ctxRef.current.clearRect(
			0,
			0,
			videoRef.current.videoWidth,
			videoRef.current.videoHeight
		);

		const { handsData, newPinchState } = drawHands(
			detectedHands,
			ctxRef.current
		);

		setHands(handsData);
		setPinchState(newPinchState);
	}, !!(detectorRef.current && videoRef.current && ctxRef.current));

	return { hands, pinchState };
}
