const axios = require('axios');
const cheerio = require('cheerio');

exports.removeAds = function(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            // Remove elements by ID
            $('#adsbygoogle').remove();
            $('#googletags').remove();

            // Remove script tags
            $('script').remove();

            resolve($.html());
        } catch (error) {
            console.error(error);
            reject('Error fetching and parsing webpage');
        }
    });
};
