import React, { useCallback } from 'react';
import YouTube from 'react-youtube';

const YouTubePlayerModal = ({ videoId, onClose }) => {
	const opts = {
		height: '390',
		width: '640',
		playerVars: {
			autoplay: 1,
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
				zIndex: 1000,
			}}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="youtube-player-content"
				style={{
					backgroundColor: 'white',
					padding: '20px',
					borderRadius: '10px',
				}}
			>
				<YouTube videoId={videoId} opts={opts} />
			</div>
		</div>
	);
};

export default YouTubePlayerModal;
