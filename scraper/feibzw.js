const axios = require('axios');
const cheerio = require('cheerio');
const translate = require('translate-google');

exports.homepage = async function() {
    const res = await axios.get('https://m.feibzw.com/');
    const $ = cheerio.load(res.data);
    const results = [];
    const elements = Array.from($('.pictext.clearfix'));

    await Promise.all(elements.map(async (element) => {
        const result = {};
        result.title = $(element).find('.text h3 a').attr('title');
        result.url = 'https://m.feibzw.com' + $(element).find('.text h3 a').attr('href');
        result.img = $(element).find('.pic a img').attr('src');

        // Translate the title
        try {
            result.title = await translate(result.title, { from: 'zh', to: 'en' });
        } catch(err) {
            console.error(err);
        }

        results.push(result);
    }));

    return results;
};

exports.search = async function(query) {
    const res = await axios.get(`https://m.feibzw.com/book/search.aspx?SearchKey=${encodeURIComponent(query)}&SearchClass=1&SeaButton=`);
    const $ = cheerio.load(res.data);
    const results = [];
    const elements = Array.from($('.book.clearfix'));

    await Promise.all(elements.map(async (element) => {
        const result = {};
        result.title = $(element).find('#CListTitle a').text();
        result.url = 'https://m.feibzw.com' + $(element).find('#CListTitle a').attr('href');

        // Translate the title
        try {
            result.title = await translate(result.title, { from: 'zh', to: 'en' });
        } catch(err) {
            console.error(err);
        }

        results.push(result);
    }));

    return results;
};
