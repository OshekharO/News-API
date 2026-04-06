const cheerio = require('cheerio');
const axios = require('axios');

const httpHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
};

async function torrent1337x(query = '', page = '1') {

    const allTorrent = [];
    let html;
    const url = 'https://www.1337xx.to/search/' + query + '/' + page + '/';
    try{
        html = await axios.get(url, { headers: httpHeaders });
    }catch{
        return null;
    }

    const $ = cheerio.load(html.data)

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
        let html;
        try{
            html = await axios.get(element, { headers: httpHeaders });
        }catch{
            return null;
        }
        const $ = cheerio.load(html.data);
        data.Name = $('.box-info-heading h1').text().trim();
        data.Magnet = $('a.torrentdown1').attr('href') || "";
        const poster = $('div.torrent-image img').attr('src');
        
        if (typeof poster !== 'undefined') {
            if (poster.startsWith('http')){
                data.Poster = poster;
            }
            else{
                data.Poster = 'https:' + poster;
            }
        } else {
            data.Poster = ''
        }

        $('ul.list li span').each((i, element) => {
            const $list = $(element);
            data[labels[i]] = $list.text();
        })
        data.Url = element

        allTorrent.push(data)
    }))

    return allTorrent
}
module.exports = {
    torrent1337x: torrent1337x
}
