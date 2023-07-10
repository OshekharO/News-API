const axios = require('axios');
const cheerio = require('cheerio');

exports.homepage = function() {
    return new Promise((resolve, reject) => {
        axios.get('https://feibzw.com')
            .then(res => {
                const $ = cheerio.load(res.data);
                const results = [];
                $('#moviesRow .movie-card').each((index, element) => {
                    const result = {};
                    result.title = $(element).find('.movie-info').first().text();
                    result.tmdbId = $(element).find('.movie-info').last().text().replace('TMDB ID: ', '');
                    result.img = $(element).find('.clickable-poster').attr('src');
                    results.push(result);
                });
                resolve(results);
            })
            .catch(reject);
    });
};

exports.search = function(query) {
    return new Promise((resolve, reject) => {
        axios.get(`https://feibzw.com/book/search.aspx?SearchKey=${encodeURIComponent(query)}&SearchClass=1&SeaButton=`)
            .then(res => {
                const $ = cheerio.load(res.data);
                const results = [];
                $('.book.clearfix').each((index, element) => {
                    const result = {};
                    result.title = $(element).find('#CListTitle a').text();
                    result.description = $(element).find('#CListText').text();
                    results.push(result);
                });
                resolve(results);
            })
            .catch(reject);
    });
};
