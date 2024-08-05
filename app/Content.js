'use client';

import React, { useState, useEffect, Suspense } from 'react';
import YouTubePlaylist from './components/YouTubePlaylist';
import YouTubePlayerModal from './components/YoutubePlayerModal';

const Content = ({ zoomLevel, onVideoSelect, selectedVideoId }) => {
	return (
		<div
			style={{
				transform: `scale(${zoomLevel / 100})`,
				transformOrigin: 'top left',
				height: '100vh', // Full viewport height
				overflow: 'hidden', // Hide overflow for zoom effect
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

export default Content;
