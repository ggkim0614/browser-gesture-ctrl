import React, { useRef, useEffect } from 'react';

const YouTubePlayerModal = ({ videoId, onClose }) => {
	const playerRef = useRef(null);

	useEffect(() => {
		// Load the YouTube Player API script
		const tag = document.createElement('script');
		tag.src = 'https://www.youtube.com/iframe_api';
		const firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		// Create YouTube player when the API is ready
		window.onYouTubeIframeAPIReady = () => {
			playerRef.current = new window.YT.Player('youtube-player', {
				height: '390',
				width: '640',
				videoId: videoId,
				events: {
					onReady: onPlayerReady,
				},
			});
		};

		function onPlayerReady(event) {
			// The player is ready
		}

		return () => {
			// Clean up
			if (playerRef.current) {
				playerRef.current.destroy();
			}
		};
	}, [videoId]);

	const handlePlayPause = () => {
		if (playerRef.current) {
			const state = playerRef.current.getPlayerState();
			if (state === window.YT.PlayerState.PLAYING) {
				playerRef.current.pauseVideo();
			} else {
				playerRef.current.playVideo();
			}
		}
	};

	return (
		<div
			className="clickable"
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
				zIndex: 1000,
			}}
		>
			<div
				className="clickable"
				style={{
					backgroundColor: 'white',
					padding: '20px',
					borderRadius: '10px',
				}}
			>
				<div id="youtube-player"></div>
				<button
					onClick={handlePlayPause}
					className="clickable"
					style={{ marginTop: '10px' }}
				>
					Play/Pause
				</button>
				<button
					onClick={onClose}
					className="clickable"
					style={{ marginTop: '10px', marginLeft: '10px' }}
				>
					Close
				</button>
			</div>
		</div>
	);
};

export default YouTubePlayerModal;
