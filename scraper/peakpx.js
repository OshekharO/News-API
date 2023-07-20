const axios = require('axios');
const cheerio = require('cheerio');

exports.scrape = async function(query, page) {
    const url = `https://www.peakpx.com/en/search?q=${encodeURIComponent(query)}&page=${page}`;

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const results = [];
        $('ul#list_ul li.grid').each((i, elem) => {
            const result = {};
            result.title = $(elem).find('figcaption[itemprop="caption description"]').text().trim();
            result.thumbnail = $(elem).find('img[itemprop="thumbnail"]').attr('data-src');
            result.image = $(elem).find('link[itemprop="contentUrl"]').attr('href');
            result.resolution = $(elem).find('span.res').text().trim();
            results.push(result);
        });
        return results;
    } catch (error) {
        console.error(`Error occurred while scraping ${url}`, error);
        throw error;
    }
};
