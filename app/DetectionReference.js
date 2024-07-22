import React, { useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';
import { drawHands } from '../lib/utils';
import * as fp from 'fingerpose';

function DetectionReference() {
	const webcamRef = useRef(null);
	const canvasRef = useRef(null);

	const [emoji, setEmoji] = useState(null);

	const runHandpose = async () => {
		const net = await handpose.load();
		//console.log("handpose model loaded");
		// loop and detect hand
		setInterval(() => {
			detect(net);
		}, 100);
	};
	const detect = async (net) => {
		if (
			typeof webcamRef.current !== 'undefined' &&
			webcamRef.current != null &&
			webcamRef.current.video.readyState === 4
		) {
			// get video properties
			const video = webcamRef.current.video;
			const videoWidth = webcamRef.current.video.videoWidth;
			const videoHeight = webcamRef.current.video.videoHeight;
			// set video width and height
			webcamRef.current.video.width = videoWidth;
			webcamRef.current.video.height = videoHeight;
			// set canvas width and height
			canvasRef.current.width = videoWidth;
			canvasRef.current.height = videoHeight;
			// make detection
			const hand = await net.estimateHands(video);

			if (hand.length > 0) {
				const GE = new fp.GestureEstimator([
					fp.Gestures.VictoryGesture,
					fp.Gestures.ThumbsUpGesture,
				]);
				const gesture = await GE.estimate(hand[0].landmarks, 8);
				if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
					const confidence = gesture.gestures.map(
						(prediction) => prediction.score
					);
					const maxConfidence = confidence.indexOf(
						Math.max.apply(null, confidence)
					);
					setEmoji(gesture.gestures[maxConfidence].name);
				}
			}

			// Draw mesh
			const ctx = canvasRef.current.getContext('2d');
			drawHands(hand, ctx);
		}
	};

	runHandpose();

	return (
		<div className="App">
			<header className="App-header">
				<Webcam
					ref={webcamRef}
					style={{
						position: 'absolute',
						marginLeft: 'auto',
						marginRight: 'auto',
						left: 0,
						right: 0,
						textAlign: 'center',
						zindex: 9,
						width: 640,
						height: 480,
					}}
				/>
				<canvas
					ref={canvasRef}
					style={{
						position: 'absolute',
						marginLeft: 'auto',
						marginRight: 'auto',
						left: 0,
						right: 0,
						textAlign: 'center',
						zindex: 9,
						width: 640,
						height: 480,
					}}
				/>
			</header>
		</div>
	);
}

export default DetectionReference;
