'use client';

// components/ZoomableContent.js
import React, { useState, useEffect, Suspense } from 'react';
import YouTubePlaylist from './components/YouTubePlaylist';
import YouTubePlayerModal from './components/YoutubePlayerModal';

const ZoomableContent = ({ zoomLevel, onVideoSelect, selectedVideoId }) => {
	const handleVideoSelect = (videoId) => {
		setSelectedVideoId(videoId);
	};

	const handleCloseModal = () => {
		setSelectedVideoId(null);
	};

	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				transform: `scale(${zoomLevel / 100})`,
				transformOrigin: 'top left',
				overflow: 'auto',
			}}
		>
			<h2>YouTube Playlist</h2>
			<YouTubePlaylist onVideoSelect={onVideoSelect} />
			{selectedVideoId && (
				<YouTubePlayerModal
					videoId={selectedVideoId}
					onClose={() => onVideoSelect(null)}
				/>
			)}
			<div className="font-mono text-gray-500 text-[24px]">OTHER CONTENT</div>
		</div>
	);
};

export default ZoomableContent;
