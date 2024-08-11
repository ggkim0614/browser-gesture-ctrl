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
			{/* navbar */}
			<div className="flex items-center justify-between font-jbm p-4 bg-white backdrop-blur-sm bg-opacity-50 border border-b-1 border-b-gray-200">
				<span className="flex items-center gap-4">
					<div className="font-bold text-gray-700 text-lg">
						DISTANT BROWSER CONTROL
					</div>
					<div className="opacity-50">v1.0</div>
				</span>
				<div className="font-medium text-gray-500">
					All work crafted by&nbsp;
					<a
						href="https://georgekim.studio/"
						className="font-semibold text-blue-500 hover:underline"
					>
						@George Kim
					</a>
				</div>
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
