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

            axios.get('https://tik.porn/')
            .then((res) => {
                const $ = cheerio.load(res.data);
                const tikporn = {};

                tikporn.title = $('.Player_player__nKEIR img').attr('alt');
                tikporn.thumbnail = $('.Player_player__nKEIR img').attr('src');
                tikporn.video = $('.Player_player__nKEIR video').attr('src');
                tikporn.likes = $('.PlayerSidebar_likeIcon__Qla40 span').text();
                tikporn.downloadLink = $('.PlayerSidebar_downloadIcon__OzDw6 a').attr('href');

                resolve({ tikporntok: results, tikporn });
            }).catch(reject);
        }).catch(reject);
    });
};
                    
