const axios = require('axios');
const cheerio = require('cheerio');

async function getRingtones(query) {
  const { data } = await axios.get(`https://musikringtone.com/search?t=${query}`);
  const $ = cheerio.load(data);
  const ringtones = $(".ring-card");
  const results = [];

  ringtones.each((index, element) => {
    const $element = $(element);
    const audioSrc = $element.find("audio.audio").attr("data-src");
    const title = $element.find(".head-card .ringnamelink").text();
    const language = $element.find(".cat-card-button").text().replace("Ringtones", "").trim();

    results.push({
      title: title,
      audioSrc: audioSrc,
      language: language,
    });
  });

  return results;
}

module.exports = getRingtones;
