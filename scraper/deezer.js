const axios = require('axios');

async function searchDeezer(query) {
  try {
    const res = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}`, {
      timeout: 10000
    });
    const items = res.data?.data || [];
    return items.map(item => ({
      id: item.id,
      title: item.title,
      title_short: item.title_short,
      link: item.link,
      duration: item.duration,
      downloadUrl: item.preview || null,
      audioStream: item.preview || null,
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
    }));
  } catch (err) {
    console.error('Deezer search error:', err.message);
    return [];
  }
}

module.exports = searchDeezer;
