const axios = require('axios');
const scrapeYoutube = require('./youtube');
const downloadYoutubeVideo = require('./ytultra');

async function getFullAudioUrl(title, artist) {
  try {
    const query = `${title} ${artist}`.trim();
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

async function searchDeezer(query) {
  try {
    const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`, {
      timeout: 10000
    });
    const items = res.data?.data || [];

    // Enrich top results with full audio stream URLs resolved via YouTube
    return await Promise.all(items.map(async (item) => {
      const fullAudioUrl = await getFullAudioUrl(item.title || '', item.artist?.name || '');
      return {
        id: item.id,
        title: item.title,
        title_short: item.title_short,
        link: item.link,
        duration: item.duration,
        previewUrl: item.preview || null,
        downloadUrl: fullAudioUrl || item.preview || null,
        audioStream: fullAudioUrl || item.preview || null,
        fullAudioUrl: fullAudioUrl || null,
        artist: {
          id: item.artist?.id,
          name: item.artist?.name,
          link: item.artist?.link,
          picture: item.artist?.picture_medium || item.artist?.picture
        },
        album: {
          id: item.album?.id,
          title: item.album?.title,
          cover: item.album?.cover_medium || item.album?.cover
        }
      };
    }));
  } catch (err) {
    console.error('Deezer search error:', err.message);
    return [];
  }
}

module.exports = searchDeezer;
