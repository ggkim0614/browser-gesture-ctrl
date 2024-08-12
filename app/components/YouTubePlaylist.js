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
							maxResults: 30,
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
			}, 2000)
		);
	};

	return (
		<div
			className="youtube-playlist clickable font-jbm overflow-y-auto overflow-x-hidden
                 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
			style={{
				padding: '20px',
				boxSizing: 'border-box',
				maxHeight: '100%',
				width: '100%', // Ensure the container takes full width
			}}
			id="youtube-playlist"
		>
			{playlistItems.map((item) => (
				<div
					key={item.id}
					onClick={() => handleItemSelect(item.snippet.resourceId.videoId)}
					className={`cursor-pointer rounded-md shadow-md 
                      youtube-playlist-item clickable bg-white hover:bg-blue-100 
                      relative overflow-hidden`}
					data-video-id={item.snippet.resourceId.videoId}
					style={{
						display: 'flex',
						flexDirection: 'column',
						transition: 'all 0.3s ease',
						border:
							selectedItem === item.snippet.resourceId.videoId
								? '4px solid #3B82F6'
								: '1px solid #E5E7EB',
					}}
				>
					<img
						src={item.snippet.thumbnails.high.url}
						alt={item.snippet.title}
						style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
						className="clickable"
					/>
					<div className="clickable text-2xl font-semibold p-4 justify-center items-center flex flex-grow">
						{item.snippet.title}
					</div>
					{selectedItem === item.snippet.resourceId.videoId && (
						<div
							className="z-50 absolute inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center text-center"
							style={{ pointerEvents: 'none' }}
						>
							<span className="text-white text-xl font-bold px-2">
								Click again to start playing
							</span>
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export default YouTubePlaylist;
