const cheerio = require('cheerio');
const axios = require('axios');

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
    timeout: 15000,
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
];

function isBlocked($) {
    const title = $('title').text().toLowerCase();
    return (
        title.includes('just a moment') ||
        title.includes('attention required') ||
        $('form#challenge-form').length > 0 ||
        $('div#cf-wrapper').length > 0
    );
}

async function torrent1337x(query = '', page = '1') {

    const allTorrent = [];

    let $;
    let baseUrl;

    for (const mirror of MIRRORS) {
        const url = `${mirror}/search/${query}/${page}/`;
        try {
            const res = await axios.get(url, axiosOpts);
            const doc = cheerio.load(res.data);
            const rows = doc('td.name');
            if (!isBlocked(doc) && rows.length > 0) {
                $ = doc;
                baseUrl = mirror;
                break;
            }
        } catch (err) {
            console.error(`1337x mirror ${mirror} failed:`, err.message);
            // try next mirror
        }
    }

    if (!$ || !baseUrl) {
        throw new Error('All 1337x mirrors are blocked or unreachable');
    }

    const links = $('td.name').map((_, element) => {
        const href = $(element).find('a').eq(1).attr('href');
        if (!href) {
            return null;
        }
        return baseUrl + href;

    }).get().filter((link) => link !== null);

    await Promise.all(links.map(async (element) => {

        const data = {};
        const labels = ['Category', 'Type', 'Language', 'Size', 'UploadedBy', 'Downloads', 'LastChecked', 'DateUploaded', 'Seeders', 'Leechers'];
        try {
            const detailHtml = await axios.get(element, axiosOpts);
            const $d = cheerio.load(detailHtml.data);
            data.Name = $d('.box-info-heading h1').text().trim();
            data.Magnet = $d('a.torrentdown1').attr('href') || "";
            const poster = $d('div.torrent-image img').attr('src');

            if (typeof poster !== 'undefined') {
                data.Poster = poster.startsWith('http') ? poster : 'https:' + poster;
            } else {
                data.Poster = '';
            }

            $d('ul.list li span').each((i, el) => {
                data[labels[i]] = $d(el).text();
            });
            data.Url = element;

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
