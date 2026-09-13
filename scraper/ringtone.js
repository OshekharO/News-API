const axios = require('axios');
const cheerio = require('cheerio');

async function getRingtones(query) {
  try {
    const res = await axios.get(`https://cellbeat.com/?s=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    const $ = cheerio.load(res.data);
    const results = [];
    const seen = new Set();

    $('a[href*="/ringtone/"]').each((_, el) => {
      const href = $(el).attr('href');
      const title = $(el).text().trim();
      if (title && title !== 'Play It' && !seen.has(href)) {
        seen.add(href);
        const slug = href.replace(/\/$/, '').split('/').pop();
        const audioSrc = `https://cellbeat.com/wp-admin/admin-ajax.php?action=download_ringtone&ringtone_slug=${slug}&ringtone_type=mp3`;
        results.push({
          title: title,
          audioSrc: audioSrc,
          url: href
        });
      }
    });

    return results;
  } catch (err) {
    console.error('Ringtone scraping error:', err.message);
    return [];
  }
}

module.exports = getRingtones;
