'use client';

import React, { useState, useEffect, Suspense } from 'react';
import YouTubePlaylist from './components/YouTubePlaylist';
import YouTubePlayerModal from './components/YoutubePlayerModal';

const Content = ({ zoomLevel, zoomOrigin, onVideoSelect, selectedVideoId }) => {
	const handleCloseModal = () => {
		onVideoSelect(null);
	};

	const zoomStyle = {
		transform: `scale(${zoomLevel / 100})`,
		transformOrigin: `${zoomOrigin.x}px ${zoomOrigin.y}px`,
		height: '100vh',
		overflow: 'hidden',
		transition: 'transform 0.1s ease-out', // Smooth transition for zooming
	};

	return (
		<div style={zoomStyle}>
			<div className="font-mono text-gray-400 p-4 text-lg">
				Distant Browser Control
			</div>
			<YouTubePlaylist onVideoSelect={onVideoSelect} />
			{selectedVideoId && (
				<YouTubePlayerModal
					videoId={selectedVideoId}
					onClose={handleCloseModal}
				/>
			)}
		</div>
	);
};

export default Content;
