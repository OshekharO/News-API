const axios = require('axios');

async function getWallpapers(query) {
  try {
    const res = await axios.get(`https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(query)}`, {
      timeout: 10000
    });
    const items = res.data?.data || [];
    return items.map(item => ({
      id: item.id,
      url: item.url,
      short_url: item.short_url,
      views: item.views,
      favorites: item.favorites,
      dimension: `${item.dimension_x}x${item.dimension_y}`,
      file_size: item.file_size,
      file_type: item.file_type,
      image: item.path,
      thumbnail: item.thumbs?.small || item.thumbs?.large || item.path
    }));
  } catch (err) {
    console.error('Wallhaven scraper error:', err.message);
    return [];
  }
}

module.exports = getWallpapers;
