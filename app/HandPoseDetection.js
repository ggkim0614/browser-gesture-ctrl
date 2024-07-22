import { useEffect, useRef, useState } from 'react';
import {
	createDetector,
	SupportedModels,
} from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { drawHands } from '../lib/utils';
import { useAnimationFrame } from '../lib/hooks/useAnimationFrame';
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';

tfjsWasm.setWasmPaths(
	`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm`
);

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

async function setupDetector() {
	const model = SupportedModels.MediaPipeHands;
	const detector = await createDetector(model, {
		runtime: 'mediapipe',
		maxHands: 2,
		solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
	});

	return detector;
}

async function setupCanvas(video) {
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = video.width;
	canvas.height = video.height;

	return ctx;
}

export default function HandPoseDetection() {
	const detectorRef = useRef();
	const videoRef = useRef();
	const [ctx, setCtx] = useState();
	const [isCameraOn, setIsCameraOn] = useState(true);
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

	useEffect(() => {
		async function initialize() {
			videoRef.current = await setupVideo();
			const ctx = await setupCanvas(videoRef.current);
			detectorRef.current = await setupDetector();

			setCtx(ctx);
		}

		initialize();
	}, []);

	useAnimationFrame(async (delta) => {
		if (!detectorRef.current || !videoRef.current || !ctx) return;

		const hands = await detectorRef.current.estimateHands(videoRef.current, {
			flipHorizontal: false,
		});

		ctx.clearRect(
			0,
			0,
			videoRef.current.videoWidth,
			videoRef.current.videoHeight
		);

		ctx.drawImage(
			videoRef.current,
			0,
			0,
			videoRef.current.videoWidth,
			videoRef.current.videoHeight
		);

		drawHands(hands, ctx);

		if (hands.length > 0) {
			const positions = {
				leftIndexTipPosX: 0,
				leftIndexTipPosY: 0,
				rightIndexTipPosX: 0,
				rightIndexTipPosY: 0,
			};

			const canvas = document.getElementById('canvas');
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const translateRatioX = viewportWidth / videoRef.current.videoWidth;
			const translateRatioY = viewportHeight / videoRef.current.videoHeight;

			hands.forEach((hand) => {
				const landmarks = hand.keypoints;
				const indexFingerTip = landmarks[8];

				if (hand.handedness === 'Right') {
					positions.leftIndexTipPosX = indexFingerTip.x * translateRatioX;
					positions.leftIndexTipPosY = indexFingerTip.y * translateRatioY;
				} else if (hand.handedness === 'Left') {
					positions.rightIndexTipPosX = indexFingerTip.x * translateRatioX;
					positions.rightIndexTipPosY = indexFingerTip.y * translateRatioY;
				}
			});

			setFingersPosition(positions);
		}
	}, !!(detectorRef.current && videoRef.current && ctx));

	return (
		<div>
			<div
				className="absolute cursor-left z-10 w-8 h-8 rounded-[32px] bg-white opacity-70 border-2 border-white shadow-sm"
				style={{
					position: 'absolute',
					top: `${fingersPosition.leftIndexTipPosY}px`,
					right: `${fingersPosition.leftIndexTipPosX}px`,
					transform: 'translate(-50%, -50%)',
				}}
			></div>
			<div
				className="absolute cursor-left z-10 w-8 h-8 rounded-[32px] bg-white opacity-70 border-2 border-white shadow-sm"
				style={{
					top: `${fingersPosition.rightIndexTipPosY}px`,
					right: `${fingersPosition.rightIndexTipPosX}px`,
					transform: 'translate(-50%, -50%)',
				}}
			></div>
			<main>
				<div className="left-4 top-4 z-10 absolute bg-gray-900 text-white w-[600px] p-6 rounded-lg flex flex-col bg-opacity-70">
					<div className="flex gap-16">
						<section className="w-[300px]">
							<div className="text-[16px] text-gray-400">
								Left Index Tip X:&nbsp;&nbsp;
							</div>
							<code className="text-gray-200">
								{fingersPosition?.leftIndexTipPosX}
							</code>
							<div className="text-[16px] text-gray-400">
								Left Index Tip Y:&nbsp;&nbsp;
							</div>
							<code className="text-gray-200">
								{fingersPosition?.leftIndexTipPosY}
							</code>
							<div className="text-[16px] text-gray-400">
								Left Thumb Tip X:&nbsp;&nbsp;
							</div>
							<code className="text-gray-200">
								{fingersPosition?.leftThumbTipPosX}
							</code>
							<div className="text-[16px] text-gray-400">
								Left Thumb Tip Y:&nbsp;&nbsp;
							</div>
							<code className="text-gray-200">
								{fingersPosition?.leftThumbTipPosY}
							</code>
						</section>
						<section className="w-[300px]">
							<div className="text-[16px] text-gray-400">
								Right Index Tip X:&nbsp;&nbsp;
							</div>
							<code className="text-gray-200">
								{fingersPosition?.rightIndexTipPosX}
							</code>
							<div className="text-[16px] text-gray-400">
								Right Index Tip Y:&nbsp;&nbsp;
							</div>
							<code className="text-gray-200">
								{fingersPosition?.rightIndexTipPosY}
							</code>
							<div className="text-[16px] text-gray-400">
								Right Thumb Tip X:&nbsp;&nbsp;
							</div>
							<code className="text-gray-200">
								{fingersPosition?.rightThumbTipPosX}
							</code>
							<div className="text-[16px] text-gray-400">
								Right Thumb Tip Y:&nbsp;&nbsp;
							</div>
							<code className="text-gray-200">
								{fingersPosition?.rightThumbTipPosY}
							</code>
						</section>
					</div>
				</div>

				<canvas
					className="bg-blue-50 border-1 border-blue-100"
					style={{
						transform: 'scaleX(-1)',
						zIndex: 1,
						width: '100vw',
						height: '100vh',
					}}
					id="canvas"
				></canvas>
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
				></video>
			</main>
		</div>
	);
}
