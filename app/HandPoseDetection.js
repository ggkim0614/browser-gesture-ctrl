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

	const handleRealClick = (x, y) => {
		const element = document.elementFromPoint(x, y);
		if (element) {
			const clickEvent = new MouseEvent('click', {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: x,
				clientY: y,
			});
			element.dispatchEvent(clickEvent);
		}
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
			const deltaY = scrollStartY[hand] - y;
			const playlistElement = document.getElementById('youtube-playlist');
			if (playlistElement) {
				playlistElement.scrollBy(0, deltaY);
			}
			setScrollStartY((prev) => ({ ...prev, [hand]: y }));
		}
	};

	useEffect(() => {
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
				// Pinch end (click)
				if (!isZooming) {
					handleRealClick(x, y);
				}
				setScrollStartY((prev) => ({ ...prev, [hand]: null }));
			}

			// Always simulate mousemove for hover effects
			const moveEvent = new MouseEvent('mousemove', {
				view: window,
				bubbles: true,
				cancelable: true,
				clientX: x,
				clientY: y,
			});
			document.elementFromPoint(x, y)?.dispatchEvent(moveEvent);
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
								transform: `
        ${hand === 'left' ? 'translate(-100%, 0%)' : 'translate(0%, 0%)'}
        scale(${pinchStatus[hand].isPinching ? 1 : 0.8})
      `,
								transition: 'transform 0.1s ease-out',
								pointerEvents: 'none',
							}}
						>
							<svg
								width="84"
								height="71"
								viewBox="0 0 205 173"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								{hand === 'left' ? (
									// Left hand SVG path
									<g clipPath="url(#clip0_82_22)">
										<path
											d="M200.119 13.4007C200.136 7.54994 193.394 4.26155 188.794 7.87692L135.42 49.8253C130.525 53.6718 132.71 61.5143 138.888 62.2763L165.159 65.517C166.707 65.7079 168.146 66.4099 169.249 67.5118L187.977 86.2186C192.381 90.6176 199.906 87.5109 199.924 81.2862L200.119 13.4007Z"
											fill="#6835F9"
										/>
										<path
											d="M163 94H37C19.3269 94 5 108.327 5 126V136C5 153.673 19.3269 168 37 168H131C148.673 168 163 153.673 163 136V94Z"
											fill="#6835F9"
										/>
										<path
											d="M44.2273 148V113.091H48.4545V144.25H64.6818V148H44.2273ZM80.6991 148.545C78.1764 148.545 76.0002 147.989 74.1707 146.875C72.3525 145.75 70.9491 144.182 69.9605 142.17C68.9832 140.148 68.4945 137.795 68.4945 135.114C68.4945 132.432 68.9832 130.068 69.9605 128.023C70.9491 125.966 72.3241 124.364 74.0855 123.216C75.8582 122.057 77.9264 121.477 80.29 121.477C81.6536 121.477 83.0002 121.705 84.3298 122.159C85.6593 122.614 86.8695 123.352 87.9605 124.375C89.0514 125.386 89.9207 126.727 90.5684 128.398C91.2161 130.068 91.54 132.125 91.54 134.568V136.273H71.3582V132.795H87.4491C87.4491 131.318 87.1536 130 86.5627 128.841C85.9832 127.682 85.1536 126.767 84.0741 126.097C83.0059 125.426 81.7445 125.091 80.29 125.091C78.6877 125.091 77.3014 125.489 76.1309 126.284C74.9718 127.068 74.0798 128.091 73.4548 129.352C72.8298 130.614 72.5173 131.966 72.5173 133.409V135.727C72.5173 137.705 72.8582 139.381 73.54 140.756C74.2332 142.119 75.1934 143.159 76.4207 143.875C77.648 144.58 79.0741 144.932 80.6991 144.932C81.7559 144.932 82.7105 144.784 83.5627 144.489C84.4264 144.182 85.1707 143.727 85.7957 143.125C86.4207 142.511 86.9036 141.75 87.2445 140.841L91.1309 141.932C90.7218 143.25 90.0343 144.409 89.0684 145.409C88.1025 146.398 86.9093 147.17 85.4889 147.727C84.0684 148.273 82.4718 148.545 80.6991 148.545ZM108.358 121.818V125.227H94.2448V121.818H108.358ZM98.472 148V118.205C98.472 116.705 98.8243 115.455 99.5289 114.455C100.233 113.455 101.148 112.705 102.273 112.205C103.398 111.705 104.586 111.455 105.836 111.455C106.824 111.455 107.631 111.534 108.256 111.693C108.881 111.852 109.347 112 109.654 112.136L108.495 115.614C108.29 115.545 108.006 115.46 107.643 115.358C107.29 115.256 106.824 115.205 106.245 115.205C104.915 115.205 103.955 115.54 103.364 116.21C102.785 116.881 102.495 117.864 102.495 119.159V148H98.472ZM124.423 121.818V125.227H110.854V121.818H124.423ZM114.809 115.545H118.832V140.5C118.832 141.636 118.996 142.489 119.326 143.057C119.667 143.614 120.099 143.989 120.621 144.182C121.156 144.364 121.718 144.455 122.309 144.455C122.752 144.455 123.116 144.432 123.4 144.386C123.684 144.33 123.911 144.284 124.082 144.25L124.9 147.864C124.627 147.966 124.246 148.068 123.758 148.17C123.269 148.284 122.65 148.341 121.9 148.341C120.763 148.341 119.65 148.097 118.559 147.608C117.479 147.119 116.582 146.375 115.866 145.375C115.161 144.375 114.809 143.114 114.809 141.591V115.545Z"
											fill="white"
										/>
									</g>
								) : (
									// Right hand SVG path
									<g>
										<path
											d="M0.88083 7.40074C0.863991 1.54996 7.60618 -1.73843 12.2063 1.87694L65.5805 43.8254C70.4746 47.6718 68.2899 55.5143 62.112 56.2763L35.8409 59.517C34.2935 59.7079 32.8541 60.41 31.7509 61.5118L13.0231 80.2186C8.61912 84.6176 1.09412 81.5109 1.07621 75.2862L0.88083 7.40074Z"
											fill="#3557F9"
										/>
										<path
											d="M38 88H164C181.673 88 196 102.327 196 120V130C196 147.673 181.673 162 164 162H70C52.3269 162 38 147.673 38 130V88Z"
											fill="#3557F9"
										/>
										<path
											d="M64.2273 142V107.091H76.0227C78.75 107.091 80.9886 107.557 82.7386 108.489C84.4886 109.409 85.7841 110.676 86.625 112.29C87.4659 113.903 87.8864 115.739 87.8864 117.795C87.8864 119.852 87.4659 121.676 86.625 123.267C85.7841 124.858 84.4943 126.108 82.7557 127.017C81.017 127.915 78.7954 128.364 76.0909 128.364H66.5454V124.545H75.9545C77.8182 124.545 79.3182 124.273 80.4545 123.727C81.6023 123.182 82.4318 122.409 82.9432 121.409C83.4659 120.398 83.7273 119.193 83.7273 117.795C83.7273 116.398 83.4659 115.176 82.9432 114.131C82.4204 113.085 81.5852 112.278 80.4375 111.71C79.2898 111.131 77.7727 110.841 75.8863 110.841H68.4545V142H64.2273ZM80.6591 126.318L89.25 142H84.3409L75.8863 126.318H80.6591Z"
											fill="white"
										/>
									</g>
								)}
							</svg>
						</div>
					))}
					<FloatingToolbar
						zoomLevel={zoomLevel}
						onResetZoom={handleResetZoom}
						style={{
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
