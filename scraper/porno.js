const axios = require('axios');
const cheerio = require('cheerio');

exports.porno = function () {
    return new Promise((resolve, reject) => {
        axios.get('https://tikporntok.com/?random=1')
        .then((res) => {
            const $ = cheerio.load(res.data)
            const results = [];

            $('.swiper-slide').each((index, element) => {
                const result = {};
                result.url = $(element).attr('data-shorts-url');
                result.videoId = $(element).attr('video-id');
                result.title = $(element).attr('data-title');
                result.thumbnail = $(element).find('.vid_bg > img').attr('src');
                result.description = $(element).find('.shorts_events > p').text();
                result.views = $(element).find('#video-views-count-' + result.videoId).text();
                result.video = $(element).find('video > source').attr('src');
                results.push(result);
            });

            resolve(results);
        }).catch(reject);
    });
};
