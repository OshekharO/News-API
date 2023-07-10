const axios = require('axios');
const cheerio = require('cheerio');

exports.search = function(query) {
    return new Promise((resolve, reject) => {
        axios.get(`https://bollywood.eu.org/?type=search&page=1&name=${query}&cat=movie`)
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

exports.homepage = function() {
    return exports.search('');
};

exports.getMovieDetails = function(id) {
    return new Promise((resolve, reject) => {
        axios.get(`https://bollywood.eu.org/?type=movie&id=${id}`)
            .then(res => {
                const $ = cheerio.load(res.data);
                const movie = {};
                movie.title = $('#title_name').text();
                movie.img = $('.poster-holder img').attr('src');
                movie.genres = $('p:contains("Genres:")').text().replace('Genres:', '').trim();
                movie.releaseDate = $('p:contains("Release Date:")').text().replace('Release Date:', '').trim();
                movie.imdbId = $('p:contains("IMDB Id:")').text().replace('IMDB Id:', '').trim();
                movie.description = $('.movie-details p').last().text().trim();
                movie.rating = $('.fa.fa-star.filled').length + $('.fa.fa-star.half-filled').length * 0.5; 
                resolve(movie);
            })
            .catch(reject);
    });
};
