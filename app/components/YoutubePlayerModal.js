// components/YouTubePlayerModal.js
import React from 'react';
import YouTube from 'react-youtube';

const YouTubePlayerModal = ({ videoId, onClose }) => {
	const opts = {
		height: '390',
		width: '640',
		playerVars: {
			autoplay: 1,
		},
	};

	return (
		<div
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
				style={{
					backgroundColor: 'white',
					padding: '20px',
					borderRadius: '10px',
				}}
			>
				<YouTube videoId={videoId} opts={opts} />
				<button onClick={onClose} style={{ marginTop: '10px' }}>
					Close
				</button>
			</div>
		</div>
	);
};

export default YouTubePlayerModal;
