const axios = require('axios');
const scrapeYoutube = require('./youtube');
const downloadYoutubeVideo = require('./ytultra');

async function getFullAudioUrl(trackName, artistName) {
  try {
    const query = `${trackName} ${artistName}`.trim();
    const videos = await scrapeYoutube(query);
    if (!videos || videos.length === 0) return null;
    const topVideo = videos[0];
    const dlResult = await downloadYoutubeVideo(topVideo.url);
    if (!dlResult || !dlResult.data || !dlResult.data.medias) return null;
    const audioMedia = dlResult.data.medias.find(m => m.format && m.format.includes('.m4a')) || dlResult.data.medias[0];
    return audioMedia ? audioMedia.url : null;
  } catch (err) {
    return null;
  }
}

async function searchItunes(query) {
  try {
    const res = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`, {
      timeout: 10000
    });
    const items = res.data?.results || [];

    // ⚡ BOLT OPTIMIZATION: Concurrently resolve YouTube audio streams for all items using Promise.all
    // Processing items concurrently via Promise.all ensures network requests execute in parallel,
    // maintaining low response latency for music search requests.
    return await Promise.all(items.map(async (item) => {
      const fullAudioUrl = await getFullAudioUrl(item.trackName || '', item.artistName || '');
      return {
        trackId: item.trackId,
        trackName: item.trackName,
        artistName: item.artistName,
        collectionName: item.collectionName,
        previewUrl: item.previewUrl || null,
        downloadUrl: fullAudioUrl || item.previewUrl || null,
        audioStream: fullAudioUrl || item.previewUrl || null,
        fullAudioUrl: fullAudioUrl || null,
        artworkUrl: item.artworkUrl100,
        trackViewUrl: item.trackViewUrl,
        releaseDate: item.releaseDate,
        primaryGenreName: item.primaryGenreName
      };
    }));
  } catch (err) {
    console.error('iTunes search error:', err.message);
    return [];
  }
}

module.exports = searchItunes;
