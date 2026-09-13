const cheerio = require('cheerio');
const axios = require('axios');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const YTS_API_MIRRORS = [
    'https://yts.lt/api/v2/list_movies.json',
    'https://yts.bz/api/v2/list_movies.json',
    'https://yts.mx/api/v2/list_movies.json',
];

async function yts(query, page = '1') {
    const pageNum = parseInt(page) || 1;
    for (const mirror of YTS_API_MIRRORS) {
        try {
            const res = await axios.get(`${mirror}?query_term=${encodeURIComponent(query)}&page=${pageNum}`, {
                headers: { 'User-Agent': UA },
                timeout: 8000
            });
            if (res.status === 200 && res.data && res.data.status === 'ok') {
                const movies = res.data.data?.movies || [];
                return movies.map(movie => ({
                    Name: movie.title_long || movie.title,
                    ReleasedDate: '' + (movie.year || ''),
                    Genre: (movie.genres || []).join(', '),
                    Rating: `${movie.rating || 0} ⭐`,
                    Likes: '' + (movie.like_count || 0),
                    Runtime: movie.runtime ? `${movie.runtime} min` : '',
                    Language: movie.language || '',
                    Url: movie.url || '',
                    Poster: movie.medium_cover_image || movie.large_cover_image || '',
                    Files: (movie.torrents || []).map(t => ({
                        Quality: t.quality || '',
                        Type: t.type || '',
                        Size: t.size || '',
                        Torrent: t.url || '',
                        Magnet: `magnet:?xt=urn:btih:${t.hash}&dn=${encodeURIComponent(movie.title)}`
                    }))
                }));
            }
        } catch {
            // try next mirror
        }
    }
    return [];
}


module.exports = {
    yts: yts
}
