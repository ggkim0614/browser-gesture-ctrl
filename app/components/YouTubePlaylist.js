// components/YouTubePlaylist.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const YouTubePlaylist = ({ onVideoSelect }) => {
	const [playlistItems, setPlaylistItems] = useState([]);

	useEffect(() => {
		const fetchPlaylistItems = async () => {
			try {
				const response = await axios.get(
					`https://www.googleapis.com/youtube/v3/playlistItems`,
					{
						params: {
							part: 'snippet',
							maxResults: 50,
							playlistId: process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID,
							key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
						},
					}
				);
				setPlaylistItems(response.data.items);
			} catch (error) {
				console.error('Error fetching playlist items:', error);
			}
		};

		fetchPlaylistItems();
	}, []);

	return (
		<div
			className="youtube-playlist"
			style={{
				display: 'flex',
				overflowX: 'auto',
				padding: '10px',
				position: 'relative',
				zIndex: 2, // Make sure this is higher than the canvas z-index
			}}
		>
			{playlistItems.map((item) => (
				<div
					key={item.id}
					onClick={() => onVideoSelect(item.snippet.resourceId.videoId)}
					className="youtube-playlist-item"
					data-video-id={item.snippet.resourceId.videoId}
					style={{
						cursor: 'pointer',
						margin: '0 10px',
						width: '200px',
						textAlign: 'center',
					}}
				>
					<img
						src={item.snippet.thumbnails.medium.url}
						alt={item.snippet.title}
						style={{ width: '100%', height: 'auto' }}
					/>
					<p>{item.snippet.title}</p>
				</div>
			))}
		</div>
	);
};

export default YouTubePlaylist;
