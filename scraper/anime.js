const axios = require('axios');

async function searchAnime(query) {
  try {
    const res = await axios.get(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=10`, {
      timeout: 10000
    });
    const items = res.data?.data || [];
    return items.map(item => {
      const attr = item.attributes || {};
      return {
        id: item.id,
        title: attr.canonicalTitle || attr.titles?.en || attr.titles?.en_jp,
        synopsis: attr.synopsis,
        startDate: attr.startDate,
        endDate: attr.endDate,
        status: attr.status,
        posterImage: attr.posterImage?.medium || attr.posterImage?.original,
        coverImage: attr.coverImage?.original || attr.coverImage?.large,
        episodeCount: attr.episodeCount,
        rating: attr.averageRating,
        ageRating: attr.ageRating
      };
    });
  } catch (err) {
    console.error('Anime search error:', err.message);
    return [];
  }
}

module.exports = searchAnime;
