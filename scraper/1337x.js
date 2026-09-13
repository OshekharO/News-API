const cheerio = require('cheerio');
const axios = require('axios');
const crypto = require('crypto');

const httpHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not-A.Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
};

const axiosOpts = {
    headers: httpHeaders,
    timeout: 10000,
    validateStatus: () => true,
};

// Mirrors tried in order; first one that returns real results is used for detail pages too
const MIRRORS = [
    'https://www.1337xx.to',
    'https://1337x.to',
    'https://1337x.st',
    'https://www.1337x.gd',
    'https://x1337x.se',
    'https://x1337x.eu',
    'https://1337x.so',
    'https://1337x.tw',
];

const D1_API_ENDPOINT = 'https://1337x-d1-static-api.zindex.eu.org/d1-web-api';

function isBlocked($, resStatus) {
    if (resStatus && resStatus !== 200) return true;
    const title = $('title').text().toLowerCase();
    return (
        title.includes('just a moment') ||
        title.includes('attention required') ||
        title.includes('access denied') ||
        $('form#challenge-form').length > 0 ||
        $('div#cf-wrapper').length > 0
    );
}

async function fetchFromD1(path) {
    const fullUrl = 'https://1337x.to' + path;
    const hash = crypto.createHash('sha256').update(fullUrl).digest('hex');
    const b64Path = Buffer.from(path).toString('base64');
    const apiUrl = `${D1_API_ENDPOINT}/${hash}?search_path=${encodeURIComponent(b64Path)}`;
    const res = await axios.get(apiUrl, axiosOpts);
    if (res.status === 200) {
        return res.data;
    }
    throw new Error(`D1 API returned status ${res.status}`);
}

async function getPageHtml(path, baseUrl) {
    if (baseUrl) {
        try {
            const res = await axios.get(`${baseUrl}${path}`, axiosOpts);
            const doc = cheerio.load(res.data);
            if (!isBlocked(doc, res.status)) {
                return { html: res.data, isD1: false };
            }
        } catch (err) {
            // direct mirror fetch failed
        }
    }
    // Fallback to D1 API
    const d1Data = await fetchFromD1(path);
    return { html: d1Data, isD1: true };
}

async function torrent1337x(query = '', page = '1') {
    const allTorrent = [];
    const searchPath = `/search/${query}/${page}/`;

    let $;
    let baseUrl;

    for (const mirror of MIRRORS) {
        const url = `${mirror}${searchPath}`;
        try {
            const res = await axios.get(url, axiosOpts);
            const doc = cheerio.load(res.data);
            const rows = doc('td.name');
            if (!isBlocked(doc, res.status) && rows.length > 0) {
                $ = doc;
                baseUrl = mirror;
                break;
            }
        } catch (err) {
            console.error(`1337x mirror ${mirror} failed:`, err.message);
        }
    }

    if (!$) {
        try {
            const d1Html = await fetchFromD1(searchPath);
            const doc = cheerio.load(d1Html);
            if (doc('td.name').length > 0) {
                $ = doc;
                baseUrl = null; // Using D1 fallback
            }
        } catch (err) {
            console.error('1337x D1 API search fallback failed:', err.message);
        }
    }

    if (!$) {
        return [];
    }

    const links = $('td.name').map((_, element) => {
        const href = $(element).find('a').eq(1).attr('href');
        if (!href) {
            return null;
        }
        return href;
    }).get().filter((link) => link !== null);

    const fieldMap = {
        'category': 'Category',
        'type': 'Type',
        'language': 'Language',
        'total size': 'Size',
        'uploaded by': 'UploadedBy',
        'downloads': 'Downloads',
        'last checked': 'LastChecked',
        'date uploaded': 'DateUploaded',
        'seeders': 'Seeders',
        'leechers': 'Leechers'
    };

    await Promise.all(links.map(async (torrentPath) => {
        const data = {};
        try {
            const { html } = await getPageHtml(torrentPath, baseUrl);
            const $d = cheerio.load(html);
            data.Name = $d('.box-info-heading h1').text().trim();
            data.Magnet = $d('a[href^="magnet:"]').attr('href') || $d('a.torrentdown1').attr('href') || "";
            const poster = $d('div.torrent-image img').attr('src');

            if (typeof poster !== 'undefined') {
                data.Poster = poster.startsWith('http') ? poster : 'https:' + poster;
            } else {
                data.Poster = '';
            }

            $d('div.torrent-detail-page ul.list li').each((i, el) => {
                const labelRaw = $d(el).find('strong').text().trim().toLowerCase();
                const valueRaw = $d(el).find('span').text().trim();
                if (labelRaw && fieldMap[labelRaw]) {
                    data[fieldMap[labelRaw]] = valueRaw;
                }
            });
            data.Url = baseUrl ? (baseUrl + torrentPath) : ('https://1337x.to' + torrentPath);

            allTorrent.push(data);
        } catch {
            // skip detail pages that fail individually
        }
    }));

    return allTorrent;
}

module.exports = {
    torrent1337x: torrent1337x
}
