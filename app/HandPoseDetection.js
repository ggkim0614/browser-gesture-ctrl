'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { drawHands } from '../lib/utils';
import { useHandTracking } from '@/lib/hooks/useHandTracking';
import { useAnimationFrame } from '../lib/hooks/useAnimationFrame';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import Content from './Content';
import FloatingToolbar from './components/Toolbar';

tfjsWasm.setWasmPaths(
	`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm`
);

export default function HandPoseDetection() {
	const { hands, pinchState } = useHandTracking();
	const [mouseState, setMouseState] = useState({ left: 'up', right: 'up' });
	const [zoomLevel, setZoomLevel] = useState(100);
	const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0 });
	const [isZooming, setIsZooming] = useState(false);
	const [prevDistance, setPrevDistance] = useState(null);
	const detectorRef = useRef();
	const videoRef = useRef();
	const [ctx, setCtx] = useState();
	const [scrollStartY, setScrollStartY] = useState({ left: null, right: null });
	const [fingersPosition, setFingersPosition] = useState({
		leftIndexTipPosX: 0,
		leftIndexTipPosY: 0,
		leftThumbTipPosX: 0,
		leftThumbTipPosY: 0,
		rightIndexTipPosX: 0,
		rightIndexTipPosY: 0,
		rightThumbTipPosX: 0,
		rightThumbTipPosY: 0,
	});
	const [pinchStatus, setPinchStatus] = useState({
		left: { isPinching: false, wasPinching: false },
		right: { isPinching: false, wasPinching: false },
	});
	const [selectedVideoId, setSelectedVideoId] = useState(null);
	const [isClient, setIsClient] = useState(false);

	const handleVideoSelect = (videoId) => {
		setSelectedVideoId(videoId);
	};

	const handleResetZoom = () => {
		setZoomLevel(100);
		setZoomOrigin({ x: 0, y: 0 });
	};

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		async function initialize() {
			videoRef.current = await setupVideo();
			const ctx = await setupCanvas(videoRef.current);
			detectorRef.current = await setupDetector();
			setCtx(ctx);
		}

		if (isClient) {
			initialize();
		}
	}, [isClient]);

	const detectedHands = useMemo(() => ({ left: false, right: false }), []);

	const handleScroll = (hand) => {
		const y = fingersPosition[`${hand}IndexTipPosY`];
		if (scrollStartY[hand] === null) {
			setScrollStartY((prev) => ({ ...prev, [hand]: y }));
		} else {
			const deltaY = scrollStartY[hand] - y; // Reverse the delta
			const playlistElement = document.getElementById('youtube-playlist');
			if (playlistElement) {
				playlistElement.scrollBy(0, deltaY); // This will now scroll in the opposite direction
			}
			setScrollStartY((prev) => ({ ...prev, [hand]: y }));
		}
	};

	useEffect(() => {
		const simulateEvent = (eventType, x, y) => {
			const element = document.elementFromPoint(x, y);
			if (element) {
				const event = new MouseEvent(eventType, {
					view: window,
					bubbles: true,
					cancelable: true,
					clientX: x,
					clientY: y,
				});
				element.dispatchEvent(event);
			}
			return element;
		};

		const handleZoom = () => {
			if (pinchStatus.left.isPinching && pinchStatus.right.isPinching) {
				const leftX = fingersPosition.leftIndexTipPosX;
				const leftY = fingersPosition.leftIndexTipPosY;
				const rightX = fingersPosition.rightIndexTipPosX;
				const rightY = fingersPosition.rightIndexTipPosY;

				const currentDistance = Math.hypot(rightX - leftX, rightY - leftY);

				if (!isZooming) {
					// Start of zooming
					setIsZooming(true);
					const midX = (leftX + rightX) / 2;
					const midY = (leftY + rightY) / 2;
					setZoomOrigin({ x: midX, y: midY });
				}

				if (prevDistance !== null) {
					const distanceRatio = currentDistance / prevDistance;
					const dampeningFactor = 0.5;
					const zoomFactor = 1 + (distanceRatio - 1) * dampeningFactor;
					const newZoomLevel = zoomLevel * zoomFactor;
					const clampedZoomLevel = Math.max(50, Math.min(300, newZoomLevel));
					setZoomLevel(clampedZoomLevel);
				}

				setPrevDistance(currentDistance);
			} else {
				setIsZooming(false);
				setPrevDistance(null);
			}
		};

		['left', 'right'].forEach((hand) => {
			const x = fingersPosition[`${hand}IndexTipPosX`];
			const y = fingersPosition[`${hand}IndexTipPosY`];

			if (pinchStatus[hand].isPinching && !pinchStatus[hand].wasPinching) {
				// Pinch start
				setScrollStartY((prev) => ({ ...prev, [hand]: y }));
			} else if (
				pinchStatus[hand].isPinching &&
				pinchStatus[hand].wasPinching
			) {
				// Pinch and drag (for scrolling)
				if (!isZooming) {
					handleScroll(hand);
				}
			} else if (
				!pinchStatus[hand].isPinching &&
				pinchStatus[hand].wasPinching
			) {
				// Pinch end
				if (!isZooming) {
					const element = simulateEvent('click', x, y);
					if (element && element.closest('#youtube-player-modal')) {
						// Only close if clicking outside the video player
						if (!element.closest('.youtube-player-content')) {
							handleVideoSelect(null);
						}
					} else if (
						element &&
						element.classList.contains('reset-zoom-button')
					) {
						// If the clicked element is the reset zoom button, call handleResetZoom
						handleResetZoom();
					}
				}
				setScrollStartY((prev) => ({ ...prev, [hand]: null }));
			}

			// Always simulate mousemove for hover effects
			simulateEvent('mousemove', x, y);
		});

		handleZoom();
	}, [pinchStatus, fingersPosition, zoomLevel, prevDistance, isZooming]);

	useAnimationFrame(async (delta) => {
		if (!detectorRef.current || !videoRef.current || !ctx) return;

		const hands = await detectorRef.current.estimateHands(videoRef.current, {
			flipHorizontal: true,
		});

		ctx.clearRect(
			0,
			0,
			videoRef.current.videoWidth,
			videoRef.current.videoHeight
		);

		const newPinchStatus = drawHands(hands, ctx);

		setPinchStatus((prevStatus) => ({
			left: {
				isPinching: newPinchStatus.left,
				wasPinching: prevStatus.left.isPinching,
			},
			right: {
				isPinching: newPinchStatus.right,
				wasPinching: prevStatus.right.isPinching,
			},
		}));

		if (hands.length > 0) {
			const positions = {
				leftIndexTipPosX: 0,
				leftIndexTipPosY: 0,
				rightIndexTipPosX: 0,
				rightIndexTipPosY: 0,
			};

			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const translateRatioX = viewportWidth / videoRef.current.videoWidth;
			const translateRatioY = viewportHeight / videoRef.current.videoHeight;

			hands.forEach((hand) => {
				const landmarks = hand.keypoints;
				const indexFingerTip = landmarks[8];

				const actualX = indexFingerTip.x * translateRatioX;
				const screenY = indexFingerTip.y * translateRatioY;

				if (hand.handedness === 'Left') {
					positions.leftIndexTipPosX = actualX;
					positions.leftIndexTipPosY = screenY;
				} else if (hand.handedness === 'Right') {
					positions.rightIndexTipPosX = actualX;
					positions.rightIndexTipPosY = screenY;
				}

				detectedHands[hand.handedness.toLowerCase()] = true;
			});

			setFingersPosition(positions);
		}
	}, !!(detectorRef.current && videoRef.current && ctx));

	return (
		<div>
			<Content
				zoomLevel={zoomLevel}
				zoomOrigin={zoomOrigin}
				onVideoSelect={handleVideoSelect}
				selectedVideoId={selectedVideoId}
			/>
			{isClient && (
				<>
					{['left', 'right'].map((hand) => (
						<div
							key={hand}
							className={`absolute cursor-${hand} z-10`}
							style={{
								position: 'absolute',
								top: `${fingersPosition[`${hand}IndexTipPosY`]}px`,
								left: `${fingersPosition[`${hand}IndexTipPosX`]}px`,
								transform:
									hand === 'left'
										? 'translate(-100%, 0%)'
										: 'translate(0%, 0%)',
								pointerEvents: 'none',
							}}
						>
							{/* SVG content */}
						</div>
					))}
					<FloatingToolbar
						zoomLevel={zoomLevel}
						onResetZoom={handleResetZoom}
						style={{
							bottom: '20px',
							left: '50%',
							transform: 'translateX(-50%)',
						}}
					/>
				</>
			)}
			<main>
				<canvas
					className="border-1 border-blue-100"
					style={{
						transform: 'scaleX(-1)',
						zIndex: 1,
						width: '100vw',
						height: '100vh',
						position: 'absolute',
						top: 0,
						left: 0,
						pointerEvents: 'none',
					}}
					id="canvas"
				/>
				<video
					style={{
						visibility: 'hidden',
						transform: 'scaleX(-1)',
						position: 'absolute',
						top: 0,
						left: 0,
						width: 0,
						height: 0,
					}}
					id="video"
					playsInline
				/>
			</main>
		</div>
	);
}

async function setupVideo() {
	const video = document.getElementById('video');
	const stream = await window.navigator.mediaDevices.getUserMedia({
		video: true,
	});

	video.srcObject = stream;
	await new Promise((resolve) => {
		video.onloadedmetadata = () => {
			resolve();
		};
	});
	video.play();

	video.width = video.videoWidth;
	video.height = video.videoHeight;

	return video;
}

async function setupCanvas(video) {
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = video.width;
	canvas.height = video.height;

	return ctx;
}

async function setupDetector() {
	const model = handPoseDetection.SupportedModels.MediaPipeHands;
	const detectorConfig = {
		runtime: 'mediapipe',
		solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
		modelType: 'full',
	};
	return handPoseDetection.createDetector(model, detectorConfig);
}
