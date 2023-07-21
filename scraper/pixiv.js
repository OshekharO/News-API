const axios = require('axios');
const cheerio = require('cheerio');

async function scrapePixiv() {
    const { data } = await axios.get('https://pixivfe.exozy.me/discovery?mode=all');
    const $ = cheerio.load(data);
    let results = [];
    
    $('.artwork-thumbnail-small').each((i, el) => {
        const imgSrc = $(el).find('img.artwork-master-image').attr('src');
        const title = $(el).find('a.artwork-thumbnail-title h3').text();
        const artworkUrl = $(el).find('a.artwork-thumbnail-title').attr('href');
        const artistName = $(el).find('.artwork-thumbnail-artist').text().trim();
        const artistAvatar = $(el).find('.artwork-thumbnail-artist-avatar').attr('src');

        let imgSrcFormatted = imgSrc.replace("/c/250x250_80_a2/custom-thumb/img", "/img-master/img").replace("_custom1200.jpg", "_master1200.jpg");
        
        results.push({
            title,
            artworkUrl: `https://pixivfe.exozy.me${artworkUrl}`,
            artistName,
            artistAvatar,
            imgSrc: imgSrcFormatted,
        });
    });
    
    return results;
}

module.exports = scrapePixiv;
