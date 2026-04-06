const cheerio = require('cheerio');
const axios = require('axios');

const httpHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
};

const axiosOpts = {
    headers: httpHeaders,
    timeout: 15000,
    validateStatus: () => true,
};

async function torrent1337x(query = '', page = '1') {

    const allTorrent = [];
    const url = 'https://www.1337xx.to/search/' + query + '/' + page + '/';

    const html = await axios.get(url, axiosOpts);

    const $ = cheerio.load(html.data);

    const links = $('td.name').map((_, element) => {
        const href = $(element).find('a').eq(1).attr('href');
        if (!href) {
            return null;
        }
        return 'https://www.1337xx.to' + href;

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
