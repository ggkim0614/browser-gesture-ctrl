import React, { useState, useEffect } from 'react';
import axios from 'axios';

const YouTubePlaylist = ({ onVideoSelect }) => {
	const [playlistItems, setPlaylistItems] = useState([]);
	const [selectedItem, setSelectedItem] = useState(null);
	const [selectionTimer, setSelectionTimer] = useState(null);

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

	const handleItemSelect = (videoId) => {
		setSelectedItem(videoId);
		if (selectionTimer) clearTimeout(selectionTimer);

		setSelectionTimer(
			setTimeout(() => {
				if (selectedItem === videoId) {
					onVideoSelect(videoId);
				}
				setSelectedItem(null);
			}, 1000)
		); // 1 second delay
	};

	return (
		<div
			className="youtube-playlist clickable"
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(3, 1fr)',
				gap: '36px',
				padding: '20px',
				boxSizing: 'border-box',
				overflowY: 'auto',
				maxHeight: '100%',
			}}
			id="youtube-playlist"
		>
			{playlistItems.map((item) => (
				<div
					key={item.id}
					onClick={() => handleItemSelect(item.snippet.resourceId.videoId)}
					className={`youtube-playlist-item clickable bg-white hover:bg-blue-100 ${
						selectedItem === item.snippet.resourceId.videoId
							? 'border-4 border-blue-500'
							: ''
					}`}
					data-video-id={item.snippet.resourceId.videoId}
					style={{
						cursor: 'pointer',
						borderRadius: '10px',
						overflow: 'hidden',
						boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
						display: 'flex',
						flexDirection: 'column',
						transition: 'all 0.3s ease',
					}}
				>
					<img
						src={item.snippet.thumbnails.high.url}
						alt={item.snippet.title}
						style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
						className="clickable"
					/>
					<div
						className="clickable text-[24px] font-mono p-4"
						style={{
							flexGrow: 1,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							textAlign: 'center',
						}}
					>
						{item.snippet.title}
					</div>
				</div>
			))}
		</div>
	);
};

export default YouTubePlaylist;
