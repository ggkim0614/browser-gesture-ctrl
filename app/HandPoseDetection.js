'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { drawHands } from '../lib/utils';
import { useHandTracking } from '@/lib/hooks/useHandTracking';
import { useAnimationFrame } from '../lib/hooks/useAnimationFrame';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';

tfjsWasm.setWasmPaths(
	`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm`
);

export default function HandPoseDetection() {
	const { hands, pinchState } = useHandTracking();
	const detectorRef = useRef();
	const videoRef = useRef();
	const [ctx, setCtx] = useState();
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

	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		if (pinchStatus.left.isPinching && !pinchStatus.left.wasPinching) {
			console.log('Left hand started pinching');
		} else if (!pinchStatus.left.isPinching && pinchStatus.left.wasPinching) {
			console.log('Left hand stopped pinching');
		}
	}, [pinchStatus.left]);

	useEffect(() => {
		if (pinchStatus.right.isPinching && !pinchStatus.right.wasPinching) {
			console.log('Right hand started pinching');
		} else if (!pinchStatus.right.isPinching && pinchStatus.right.wasPinching) {
			console.log('Right hand stopped pinching');
		}
	}, [pinchStatus.right]);

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
			{isClient && (
				<>
					{/*
				LEFT CURSOR
				 */}
					<div
						className="absolute cursor-left z-10"
						style={{
							position: 'absolute',
							top: `${fingersPosition.leftIndexTipPosY}px`,
							left: `${fingersPosition.leftIndexTipPosX}px`,
							transform: 'translate(-100%, 0%)',
						}}
					>
						<svg
							width="84"
							height="71"
							viewBox="0 0 205 173"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
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
							<defs>
								<clipPath id="clip0_82_22">
									<rect width="205" height="173" fill="white" />
								</clipPath>
							</defs>
						</svg>
					</div>
					{/*
				RIGHT CURSOR
				 */}
					<div
						className="absolute cursor-left z-10"
						style={{
							top: `${fingersPosition.rightIndexTipPosY}px`,
							left: `${fingersPosition.rightIndexTipPosX}px`,
							transform: 'translate(0%, 0%)',
						}}
					>
						<svg
							width="84"
							height="71"
							viewBox="0 0 196 162"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
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
							<path
								d="M93.4249 142V115.818H97.4477V142H93.4249ZM95.4704 111.455C94.6863 111.455 94.0102 111.188 93.442 110.653C92.8852 110.119 92.6068 109.477 92.6068 108.727C92.6068 107.977 92.8852 107.335 93.442 106.801C94.0102 106.267 94.6863 106 95.4704 106C96.2545 106 96.9249 106.267 97.4818 106.801C98.0499 107.335 98.334 107.977 98.334 108.727C98.334 109.477 98.0499 110.119 97.4818 110.653C96.9249 111.188 96.2545 111.455 95.4704 111.455Z"
								fill="white"
							/>
							<path
								d="M114.424 152.364C112.481 152.364 110.81 152.114 109.412 151.614C108.015 151.125 106.85 150.477 105.918 149.67C104.998 148.875 104.265 148.023 103.719 147.114L106.924 144.864C107.287 145.341 107.748 145.886 108.304 146.5C108.861 147.125 109.623 147.665 110.589 148.119C111.566 148.585 112.844 148.818 114.424 148.818C116.537 148.818 118.282 148.307 119.657 147.284C121.032 146.261 121.719 144.659 121.719 142.477V137.159H121.378C121.083 137.636 120.662 138.227 120.117 138.932C119.583 139.625 118.81 140.244 117.799 140.79C116.799 141.324 115.446 141.591 113.742 141.591C111.628 141.591 109.731 141.091 108.049 140.091C106.378 139.091 105.054 137.636 104.077 135.727C103.111 133.818 102.628 131.5 102.628 128.773C102.628 126.091 103.1 123.756 104.043 121.767C104.986 119.767 106.299 118.222 107.981 117.131C109.662 116.028 111.606 115.477 113.81 115.477C115.515 115.477 116.867 115.761 117.867 116.33C118.878 116.886 119.651 117.523 120.185 118.239C120.731 118.943 121.151 119.523 121.446 119.977H121.856V115.818H125.742V142.75C125.742 145 125.231 146.83 124.208 148.239C123.196 149.659 121.833 150.699 120.117 151.358C118.412 152.028 116.515 152.364 114.424 152.364ZM114.287 137.977C115.901 137.977 117.265 137.608 118.378 136.869C119.492 136.131 120.339 135.068 120.918 133.682C121.498 132.295 121.787 130.636 121.787 128.705C121.787 126.818 121.503 125.153 120.935 123.71C120.367 122.267 119.526 121.136 118.412 120.318C117.299 119.5 115.924 119.091 114.287 119.091C112.583 119.091 111.162 119.523 110.026 120.386C108.901 121.25 108.054 122.409 107.486 123.864C106.929 125.318 106.651 126.932 106.651 128.705C106.651 130.523 106.935 132.131 107.503 133.528C108.083 134.915 108.935 136.006 110.06 136.801C111.196 137.585 112.606 137.977 114.287 137.977Z"
								fill="white"
							/>
							<path
								d="M136.168 126.25V142H132.146V107.091H136.168V119.909H136.509C137.123 118.557 138.043 117.483 139.271 116.688C140.509 115.881 142.157 115.477 144.214 115.477C145.998 115.477 147.56 115.835 148.901 116.551C150.242 117.256 151.282 118.341 152.021 119.807C152.771 121.261 153.146 123.114 153.146 125.364V142H149.123V125.636C149.123 123.557 148.583 121.949 147.504 120.813C146.435 119.665 144.952 119.091 143.055 119.091C141.736 119.091 140.555 119.369 139.509 119.926C138.475 120.483 137.657 121.295 137.055 122.364C136.464 123.432 136.168 124.727 136.168 126.25Z"
								fill="white"
							/>
							<path
								d="M170.931 115.818V119.227H157.363V115.818H170.931ZM161.318 109.545H165.34V134.5C165.34 135.636 165.505 136.489 165.835 137.057C166.176 137.614 166.607 137.989 167.13 138.182C167.664 138.364 168.227 138.455 168.818 138.455C169.261 138.455 169.624 138.432 169.909 138.386C170.193 138.33 170.42 138.284 170.59 138.25L171.409 141.864C171.136 141.966 170.755 142.068 170.267 142.17C169.778 142.284 169.159 142.341 168.409 142.341C167.272 142.341 166.159 142.097 165.068 141.608C163.988 141.119 163.09 140.375 162.374 139.375C161.67 138.375 161.318 137.114 161.318 135.591V109.545Z"
								fill="white"
							/>
						</svg>
					</div>
				</>
			)}
			<main>
				<div>
					<canvas
						className="bg-blue-50 border-1 border-blue-100"
						style={{
							transform: 'scaleX(-1)',
							zIndex: 1,
							width: '100vw',
							height: '100vh',
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
				</div>
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
