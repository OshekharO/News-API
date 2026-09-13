const axios = require('axios');
const { nyaaSI } = require('./nyaaSI');

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
        ageRating: attr.ageRating,
        episodesEndpoint: `/api/anime/episodes/${item.id}`
      };
    });
  } catch (err) {
    console.error('Anime search error:', err.message);
    return [];
  }
}

async function getAnimeEpisodes(animeId) {
  const headers = {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };

  try {
    let epRes, streamRes, animeRes;
    try {
      epRes = await axios.get(`https://kitsu.io/api/edge/anime/${animeId}/episodes?page[limit]=20`, { headers, timeout: 10000 });
    } catch {
      epRes = { data: { data: [] } };
    }
    try {
      streamRes = await axios.get(`https://kitsu.io/api/edge/anime/${animeId}/streaming-links`, { headers, timeout: 10000 });
    } catch {
      streamRes = { data: { data: [] } };
    }
    try {
      animeRes = await axios.get(`https://kitsu.io/api/edge/anime/${animeId}`, { headers, timeout: 10000 });
    } catch {
      animeRes = { data: { data: null } };
    }

    const animeTitle = animeRes.data?.data?.attributes?.canonicalTitle || 'Anime';
    const streamingLinks = (streamRes.data?.data || []).map(item => item.attributes?.url).filter(Boolean);

    const mainTorrents = await nyaaSI(animeTitle, '1').catch(() => []);

    const rawEpisodes = epRes.data?.data || [];
    const episodes = rawEpisodes.map(item => {
      const attr = item.attributes || {};
      const epTitle = attr.canonicalTitle || attr.titles?.en || attr.titles?.en_jp || `Episode ${attr.number}`;
      const searchKey = `${animeTitle} Episode ${attr.number}`;

      return {
        number: attr.number,
        title: epTitle,
        synopsis: attr.synopsis,
        airdate: attr.airdate,
        length: attr.length ? `${attr.length} min` : null,
        thumbnail: attr.thumbnail?.original || attr.thumbnail?.large || null,
        watchLinks: streamingLinks,
        torrentDownloadSearch: `https://nyaa.si/?q=${encodeURIComponent(searchKey)}`
      };
    });

    return {
      animeId,
      animeTitle,
      totalEpisodes: episodes.length,
      streamingLinks,
      downloads: mainTorrents.slice(0, 5).map(t => ({
        name: t.Name,
        size: t.Size,
        category: t.Category,
        torrentFile: t.Torrent,
        magnetLink: t.Magnet,
        seeders: t.Seeders,
        leechers: t.Leechers
      })),
      episodes
    };
  } catch (err) {
    console.error('Anime episodes error:', err.message);
    return { animeId, error: err.message, episodes: [] };
  }
}

module.exports = {
  searchAnime,
  getAnimeEpisodes
};
