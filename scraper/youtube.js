const axios = require('axios');

async function scrapeYoutube(query) {
  try {
    const res = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    });
    const match = res.data.match(/var ytInitialData = ({.*?});<\/script>/);
    if (!match) return [];
    const data = JSON.parse(match[1]);
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
    const videos = [];
    for (const item of contents) {
      const v = item.videoRenderer;
      if (v && v.videoId) {
        const videoUrl = `https://www.youtube.com/watch?v=${v.videoId}`;
        videos.push({
          id: v.videoId,
          title: v.title?.runs?.[0]?.text || '',
          thumbnail: v.thumbnail?.thumbnails?.[0]?.url || '',
          channel: v.ownerText?.runs?.[0]?.text || '',
          published: v.publishedTimeText?.simpleText || '',
          duration: v.lengthText?.simpleText || '',
          views: v.viewCountText?.simpleText || '',
          url: videoUrl,
          downloadApiUrl: `/api/youtube/download?url=${encodeURIComponent(videoUrl)}`
        });
      }
    }
    return videos;
  } catch (err) {
    console.error('YouTube search scraper error:', err.message);
    return [];
  }
}

module.exports = scrapeYoutube;
