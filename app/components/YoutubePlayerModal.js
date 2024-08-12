import React, { useCallback, useRef, useState, useEffect } from 'react';
import YouTube from 'react-youtube';

const YouTubePlayerModal = ({ videoId, onClose, style }) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPlayerReady, setIsPlayerReady] = useState(false);
	const playerRef = useRef(null);
	const [playerState, setPlayerState] = useState(null);

	const opts = {
		height: '390',
		width: '640',
		playerVars: {
			autoplay: 0,
			controls: 1,
		},
	};

	const handleOverlayClick = useCallback(
		(e) => {
			if (e.target === e.currentTarget) {
				onClose();
			}
		},
		[onClose]
	);

	const togglePlayPause = useCallback(() => {
		console.log('Toggle Play/Pause clicked');
		if (isPlayerReady && playerRef.current) {
			if (isPlaying) {
				console.log('Attempting to pause');
				playerRef.current.pauseVideo();
			} else {
				console.log('Attempting to play');
				playerRef.current.playVideo();
			}
		} else {
			console.warn('Player is not ready yet');
		}
	}, [isPlayerReady, isPlaying]);

	const onReady = useCallback((event) => {
		console.log('Player is ready');
		playerRef.current = event.target;
		setIsPlayerReady(true);
	}, []);

	const onStateChange = useCallback((event) => {
		console.log('Player state changed:', event.data);
		setPlayerState(event.data);

		if (event.data === YouTube.PlayerState.PLAYING) {
			setIsPlaying(true);
		} else if (
			event.data === YouTube.PlayerState.PAUSED ||
			event.data === YouTube.PlayerState.ENDED
		) {
			setIsPlaying(false);
		}
	}, []);

	useEffect(() => {
		const handleKeyPress = (event) => {
			if (event.key === ' ' || event.key === 'Spacebar') {
				event.preventDefault();
				togglePlayPause();
			}
		};

		window.addEventListener('keydown', handleKeyPress);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, [togglePlayPause]);

	return (
		<div
			id="youtube-player-modal"
			onClick={handleOverlayClick}
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				backgroundColor: 'rgba(0, 0, 0, 0.7)',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				zIndex: 10000,
				...style,
			}}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="youtube-player-content"
				style={{
					backgroundColor: 'white',
					padding: '20px',
					borderRadius: '10px',
					position: 'relative',
					zIndex: 10001,
				}}
			>
				<YouTube
					videoId={videoId}
					opts={opts}
					onReady={onReady}
					onStateChange={onStateChange}
				/>
				<div style={{ marginTop: '10px' }}>
					<button
						onClick={togglePlayPause}
						disabled={!isPlayerReady}
						className={`text-3xl text-center reset-zoom-button font-jbm rounded-full cursor-pointer text-white bg-[#167DFF] transition-colors hover:bg-[#4268ff] border-none px-16 py-9 ${
							!isPlayerReady ? 'opacity-50 cursor-not-allowed' : ''
						}`}
					>
						{isPlaying ? 'Pause' : 'Play'}
					</button>
					<button
						onClick={onClose}
						style={{ marginLeft: '10px' }}
						className="text-3xl text-center reset-zoom-button font-jbm rounded-full cursor-pointer text-white bg-[#fb7131] transition-colors hover:bg-[#4268ff] border-none px-16 py-9"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default YouTubePlayerModal;
