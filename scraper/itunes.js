const axios = require('axios');

async function searchItunes(query) {
  try {
    const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`, {
      timeout: 10000
    });
    const items = res.data?.results || [];
    return items.map(item => ({
      trackId: item.trackId,
      trackName: item.trackName,
      artistName: item.artistName,
      collectionName: item.collectionName,
      downloadUrl: item.previewUrl || null,
      audioStream: item.previewUrl || null,
      artworkUrl: item.artworkUrl100,
      trackViewUrl: item.trackViewUrl,
      releaseDate: item.releaseDate,
      primaryGenreName: item.primaryGenreName
    }));
  } catch (err) {
    console.error('iTunes search error:', err.message);
    return [];
  }
}

module.exports = searchItunes;
