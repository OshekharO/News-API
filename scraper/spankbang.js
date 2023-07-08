const axios = require('axios');
const cheerio = require('cheerio');

exports.spankbangVideo = function (videoId) {
    return new Promise((resolve, reject) => {
        axios.get(`https://spankbang.com/${videoId}/video/`)
        .then((res) => {
            const $ = cheerio.load(res.data)
            const video = {};

            const videoElement = $('#video');
            video.id = videoElement.attr('data-videoid');
            video.url = $('video > source').attr('src');
            video.thumbnail = $('.play_cover > img').attr('data-src');
            video.title = $('.play_cover > img').attr('title');
            video.length = $('.hd-time > .i-length').text();
            video.quality = $('.hd-time > .i-hd').text();
            video.views = $('.i-plays').text();

            resolve(video);
        }).catch(reject);
    });
};

exports.spankbangTrending = function (page = 1) {
    return new Promise((resolve, reject) => {
        axios.get(`https://spankbang.com/trending_videos/${page}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
          }
        })
        .then((res) => {
            const $ = cheerio.load(res.data)
            const results = [];

            $('.video-item').each((index, element) => {
                const result = {};
                result.id = $(element).attr('data-id');
                result.title = $(element).find('.thumb').attr('title');
                result.thumbnail = $(element).find('.cover').attr('data-src');
                result.link = `https://spankbang.com${$(element).find('.thumb').attr('href')}`;
                result.duration = $(element).find('.l').text();
                result.views = $(element).find('.v').text();
                result.rating = $(element).find('.r').text();
                result.uploaded = $(element).find('.d').text();
                results.push(result);
            });

            resolve(results);
        }).catch(reject);
    });
};
