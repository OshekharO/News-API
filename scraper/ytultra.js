const axios = require('axios');

async function downloadYoutubeVideo(videoUrl) {
  try {
    const res = await axios.post('https://api.ytultra.com/ikool/youtube/download', {
      url: videoUrl
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://www.ytultra.com/en/youtube-video-downloader/'
      },
      timeout: 15000
    });

    if (res.status === 200 && res.data && res.data.code === '0000') {
      return res.data;
    }
    return { error: 'Failed to resolve YouTube video downloads', details: res.data };
  } catch (err) {
    console.error('ytultra error:', err.message);
    return { error: err.message };
  }
}

module.exports = downloadYoutubeVideo;
