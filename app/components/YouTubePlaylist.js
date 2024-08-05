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
							maxResults: 20,
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
			className="youtube-playlist clickable"
			style={{
				display: 'flex',
				flexDirection: 'column', // Change to vertical layout
				overflowY: 'auto', // Enable vertical scrolling
				height: '100vh', // Set a fixed height or adjust as needed
				padding: '10px',
			}}
			id="youtube-playlist" // Add an id for easy reference
		>
			{playlistItems.map((item) => (
				<div
					key={item.id}
					onClick={() => onVideoSelect(item.snippet.resourceId.videoId)}
					className="youtube-playlist-item clickable bg-white hover:bg-blue-100"
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
						className="clickable"
					/>
					<div className="clickable text-[14px] font-mono">
						{item.snippet.title}
					</div>
				</div>
			))}
		</div>
	);
};

export default YouTubePlaylist;
