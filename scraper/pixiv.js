const axios = require('axios');
const cheerio = require('cheerio');

async function scrapePixiv(query, page = 1) {
    const url = `https://pixivfe.exozy.me/tags/${encodeURIComponent(query)}?order=date_d&page=${page}&mode=safe`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const artworks = [];

    $('.artwork-mobile').each((i, el) => {
        const $el = $(el);
        const artwork = {
            title: $el.find('.artwork-thumbnail-title').text().trim(),
            artist: $el.find('.artwork-thumbnail-artist').text().trim(),
            image: $el.find('.artwork-master-image').attr('src').replace('/c/250x250_80_a2/custom-thumb/', '/img-master/').replace('_custom1200', '_master1200'),
            link: 'https://pixivfe.exozy.me' + $el.find('.artwork-thumbnail-title').attr('href'),
        };
        artworks.push(artwork);
    });

    return artworks;
}

module.exports = scrapePixiv;
