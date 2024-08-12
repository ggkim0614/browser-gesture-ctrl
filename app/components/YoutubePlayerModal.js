import React, { useCallback, useRef, useState, useEffect } from 'react';
import YouTube from 'react-youtube';

const YouTubePlayerModal = ({ videoId, onClose, onControlsReady, style }) => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isPlayerReady, setIsPlayerReady] = useState(false);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [playerSize, setPlayerSize] = useState({
		width: '100%',
		height: '100%',
	});
	const playerRef = useRef(null);
	const containerRef = useRef(null);

	useEffect(() => {
		const updatePlayerSize = () => {
			if (containerRef.current) {
				const toolbarHeight =
					document.querySelector('.bg-black.bg-opacity-65.fixed.bottom-0')
						?.offsetHeight || 0;
				const availableHeight = window.innerHeight - toolbarHeight;
				const availableWidth = window.innerWidth;
				const aspectRatio = 16 / 9; // Typical YouTube aspect ratio

				let width = availableWidth;
				let height = width / aspectRatio;

				if (height > availableHeight) {
					height = availableHeight;
					width = height * aspectRatio;
				}

				setPlayerSize({ width: `${width}px`, height: `${height}px` });
			}
		};

		updatePlayerSize();
		window.addEventListener('resize', updatePlayerSize);

		return () => window.removeEventListener('resize', updatePlayerSize);
	}, []);

	useEffect(() => {
		if (
			isPlayerReady &&
			playerRef.current &&
			typeof onControlsReady === 'function'
		) {
			onControlsReady({
				togglePlayPause: () => {
					if (isPlaying) {
						playerRef.current.pauseVideo();
					} else {
						playerRef.current.playVideo();
					}
					setIsPlaying(!isPlaying);
				},
				seekVideo: (seconds) => {
					const currentTime = playerRef.current.getCurrentTime();
					playerRef.current.seekTo(currentTime + seconds, true);
				},
				isPlaying,
			});
		}
	}, [isPlayerReady, isPlaying, onControlsReady]);

	const opts = {
		width: playerSize.width,
		height: playerSize.height,
		playerVars: {
			autoplay: 0,
			controls: 1,
		},
	};

	const togglePlayPause = () => {
		if (isPlayerReady && playerRef.current) {
			if (isPlaying) {
				playerRef.current.pauseVideo();
			} else {
				playerRef.current.playVideo();
			}
			setIsPlaying(!isPlaying);
		}
	};

	const seekVideo = (seconds) => {
		if (isPlayerReady && playerRef.current) {
			const currentTime = playerRef.current.getCurrentTime();
			playerRef.current.seekTo(currentTime + seconds, true);
		}
	};

	const onReady = (event) => {
		playerRef.current = event.target;
		setIsPlayerReady(true);
	};

	const onStateChange = (event) => {
		setIsPlaying(event.data === YouTube.PlayerState.PLAYING);
	};

	return (
		<div
			id="youtube-player-modal"
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				backgroundColor: 'rgba(0, 0, 0, 0.7)',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				zIndex: 500,
				...style,
			}}
		>
			<div
				ref={containerRef}
				onClick={(e) => e.stopPropagation()}
				className="youtube-player-content"
				style={{
					backgroundColor: 'black',
					position: 'relative',
					zIndex: 10000,
					width: playerSize.width,
					height: playerSize.height,
				}}
			>
				<YouTube
					videoId={videoId}
					opts={opts}
					onReady={onReady}
					onStateChange={onStateChange}
				/>
			</div>
		</div>
	);
};

export default YouTubePlayerModal;
