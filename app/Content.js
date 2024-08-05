// components/ZoomableContent.js
import React from 'react';
import SpotifyPlaylist from './SpotifyPlaylist';
import YouTubePlaylist from './YouTubePlaylist';

const ZoomableContent = ({ zoomLevel }) => {
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
			<SpotifyPlaylist />
			<YouTubePlaylist />
			<div className="text-[24px] text-yellow-600">This is Content</div>
		</div>
	);
};

export default ZoomableContent;
