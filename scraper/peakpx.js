const axios = require('axios');
const cheerio = require('cheerio');

exports.search = function(query, page = 1) {
    return new Promise((resolve, reject) => {
        axios.get(`https://www.peakpx.com/en/search?q=${query}&page=${page}`)
            .then(res => {
                const $ = cheerio.load(res.data);
                const images = [];
                $('#list_ul .grid').each((index, element) => {
                    const image = {};
                    image.title = $(element).find('.title').text().trim();
                    image.imageUrl = $(element).find('link[itemprop="contentUrl"]').attr('href');
                    images.push(image);
                });
                resolve(images);
            })
            .catch(reject);
    });
};
