const cheerio = require('cheerio');
const axios = require('axios');


const MIRRORS = [
    'https://nyaa.si',
    'https://nyaa.land',
    'https://nyaa.iss.ink'
];

async function nyaaSI(query, page = '1') {
    let torrents = [];
    let html = null;
    let domain = '';

    for (const mirror of MIRRORS) {
        const url = mirror + '/?f=0&c=0_0&q=' + query + '&p=' + page;
        try {
            const res = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 8000
            });
            if (res.status === 200 && res.data) {
                html = res.data;
                domain = mirror;
                break;
            }
        } catch {
            // try next
        }
    }

    if (!html) {
        return [];
    }
    const regex = /.comments/gi;
    const nameRegex = /[a-zA-Z\W].+/g;

    const $ = cheerio.load(html);

    $('tbody tr').each((_, element) => {

        try {
            const data = {};
            const td = $(element).children('td');
            const nameMatch = $(element).find('td[colspan="2"] a').text().trim().match(nameRegex);
            data.Name = nameMatch ? nameMatch[0] : $(element).find('td[colspan="2"] a').text().trim();
            data.Category = $(element).find('a').attr('title');
            data.Url = (domain + $(element).find('td[colspan="2"] a').attr('href')).replace(regex, '');
            data.Size = $(td).eq(3).text();
            data.DateUploaded = $(td).eq(4).text();
            data.Seeders = $(td).eq(5).text();
            data.Leechers = $(td).eq(6).text();
            data.Downloads = $(td).eq(7).text();
            data.Torrent = domain + $(element).find('.text-center a').attr('href');
            data.Magnet = $(element).find('.text-center a').next().attr('href');

            if (data.Name) {
                torrents.push(data);
            }
        } catch {
            // skip rows that fail to parse
        }

    });

    return torrents;
}

module.exports = {
    nyaaSI: nyaaSI
}
