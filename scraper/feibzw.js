const axios = require('axios');
const cheerio = require('cheerio');

// Function to translate text using LibreTranslate
async function translate(text) {
    const response = await axios.post('https://libretranslate.de/translate', {
        q: text,
        source: 'zh',
        target: 'en',
    });
    return response.data.translatedText;
}

exports.homepage = function () {
    return new Promise((resolve, reject) => {
        axios.get('https://feibzw.com/')
            .then(async res => {
                const $ = cheerio.load(res.data);
                const results = [];
                const elements = $('.pictext');
                for(let i = 0; i < elements.length; i++){
                    const result = {};
                    result.title = await translate($(elements[i]).find('h3 > a').attr('title'));
                    result.link = $(elements[i]).find('h3 > a').attr('href');
                    result.img = $(elements[i]).find('.pic > a > img').attr('src');
                    results.push(result);
                };
                resolve(results);
            })
            .catch(reject);
    });
};

exports.search = function(query) {
    return new Promise((resolve, reject) => {
        axios.get(`https://feibzw.com/book/search.aspx?SearchKey=${encodeURI(query)}&SearchClass=1&SeaButton=`)
            .then(async res => {
                const $ = cheerio.load(res.data);
                const results = [];
                const elements = $('.book');
                for(let i = 0; i < elements.length; i++){
                    const result = {};
                    result.title = await translate($(elements[i]).find('#CListTitle > a').attr('title'));
                    result.link = $(elements[i]).find('#CListTitle > a').attr('href');
                    result.description = await translate($(elements[i]).find('#CListText').text());
                    results.push(result);
                };
                resolve(results);
            })
            .catch(reject);
    });
};
