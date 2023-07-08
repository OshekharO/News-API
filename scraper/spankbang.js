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
        axios.get(`https://spankbang.com/trending_videos/${page}`)
        .then((res) => {
            const $ = cheerio.load(res.data)
            const videos = [];

            $('.video-item').each((index, element) => {
                const video = {};
                video.id = $(element).attr('data-id');
                video.url = 'https://spankbang.com' + $(element).find('a.thumb').attr('href');
                video.title = $(element).find('a.thumb').attr('title');
                video.thumbnail = $(element).find('img.cover').attr('data-src');
                video.length = $(element).find('.l').text();
                video.views = $(element).find('.v').text();
                video.uploadTime = $(element).find('.d').text();
                videos.push(video);
            });

            resolve(videos);
        }).catch(reject);
    });
};
