const axios = require('axios');

async function getStations(page = 1) {
  try {
    const { data } = await axios.get('http://de1.api.radio-browser.info/json/stations/topvote');
    const start = (page - 1) * 10;
    const end = start + 10;
    const stationsPage = data.slice(start, end);
    return stationsPage.map(station => ({
      name: station.name,
      url: station.url_resolved,
      country: station.country,
      language: station.language,
    }));
  } catch (error) {
    throw error;
  }
}

module.exports = getStations;
