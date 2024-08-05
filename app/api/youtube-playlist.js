// pages/api/youtube-playlist.js
import axios from 'axios';

export default async function handler(req, res) {
	try {
		const response = await axios.get(
			`https://www.googleapis.com/youtube/v3/playlistItems`,
			{
				params: {
					part: 'snippet',
					maxResults: 50,
					playlistId: process.env.NEXT_PUBLIC_PLAYLIST_ID,
					key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
				},
			}
		);
		res.status(200).json(response.data.items);
	} catch (error) {
		console.error('Error fetching playlist items:', error);
		res.status(500).json({ error: 'Error fetching playlist items' });
	}
}
