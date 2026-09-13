const axios = require('axios');
const cheerio = require('cheerio');

async function scrapePixiv(query, page = 1) {
    try {
        const validatedPage = validatePage(page);
        const validatedQuery = validateQuery(query);
        
        const url = `https://www.pixiv.net/ajax/search/artworks/${encodeURIComponent(validatedQuery)}?p=${validatedPage}`;
        
        const { data, status } = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Referer': 'https://www.pixiv.net/',
                'Accept': 'application/json, text/plain, */*'
            }
        });
        
        if (status !== 200 || data.error) {
            throw new Error(data.message || `Server returned status: ${status}`);
        }
        
        const items = data.body?.illustManga?.data || [];
        const artworks = items.filter(item => item.id).map(item => ({
            title: item.title || item.illustTitle || 'Untitled',
            artist: item.userName || item.userAccount || 'Unknown Artist',
            artistAvatar: item.profileImageUrl || null,
            image: item.url ? item.url.replace('/c/250x250_80_a2/', '/') : null,
            thumbnail: item.url || null,
            link: `https://www.pixiv.net/artworks/${item.id}`,
            artworkId: item.id
        }));

        return artworks;
        
    } catch (error) {
        console.error('Pixiv API error details:', error.message);
        throw new Error(`Scraping error: ${error.message}`);
    }
}

// Helper function to transform image URL
function transformImageUrl(url) {
    if (!url) return null;
    
    // Remove proxy prefix if present
    let transformedUrl = url.replace('/proxy/i.pximg.net', 'https://i.pximg.net');
    
    // Transform to higher quality version
    transformedUrl = transformedUrl
        .replace('_square1200', '_master1200')
        .replace('/c/250x250_80_a2/img-master/', '/img-master/')
        .replace('/c/250x250_80_a2/', '/');
    
    return transformedUrl;
}

// Helper function to extract artwork ID from URL
function extractArtworkId(url) {
    if (!url) return null;
    const match = url.match(/\/artworks\/(\d+)/);
    return match ? match[1] : null;
}

// Validation functions
function validatePage(page) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > 100) {
        return 1;
    }
    return pageNum;
}

function validateQuery(query) {
    if (!query || query.trim().length === 0) {
        throw new Error('Query parameter is required');
    }
    if (query.length > 100) {
        throw new Error('Query parameter too long');
    }
    return query.trim();
}

module.exports = scrapePixiv;
