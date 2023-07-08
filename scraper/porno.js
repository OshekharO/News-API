const axios = require('axios');
const cheerio = require('cheerio');

exports.porno = function() {
    return new Promise((resolve, reject) => {
        axios.get('https://tikporntok.com/?random=1')
        .then((res) => {
            const $ = cheerio.load(res.data)
            const result = {
                title: $('article > h1').text(),
                source: $('article > div.video-wrapper.vxplayer').attr('data-post'),
                thumb: $('article > div.video-wrapper.vxplayer > div.vx_el').attr('data-poster'),
                desc: $('article > div.intro').text(),
                upload: $('article > div.single-pre-meta.ws.clearfix > time').text(),
                like: $('article > div.single-pre-meta.ws.clearfix > div > span:nth-child(1) > span').text(),
                dislike: $('article > div.single-pre-meta.ws.clearfix > div > span:nth-child(2) > span').text(),
                favorite: $('article > div.single-pre-meta.ws.clearfix > div > span:nth-child(3) > span').text(),
                views: $('article > div.single-pre-meta.ws.clearfix > div > span:nth-child(4) > span').text(),
                tags: $('article > div.post-tags').text(),
                video: $('article > div.video-wrapper.vxplayer > div.vx_el').attr('src') || $('article > div.video-wrapper.vxplayer > div.vx_el').attr('data-src')
            }
            resolve(result);
        }).catch(reject);
    });
};
