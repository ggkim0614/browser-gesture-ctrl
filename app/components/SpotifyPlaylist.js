// components/SpotifyPlaylist.js
import React, { useEffect, useState } from 'react';

const SpotifyPlaylist = () => {
	const [playlists, setPlaylists] = useState([]);

	useEffect(() => {
		// Fetch Spotify playlists using their API
		// Update the playlists state
	}, []);

	return (
		<div>
			<div className="text-[36px] font-semibold text-lime-600">
				Spotify Playlists
			</div>
			<button className="border b-1-black">click me</button>
			{/* Render playlists */}
		</div>
	);
};

export default SpotifyPlaylist;
