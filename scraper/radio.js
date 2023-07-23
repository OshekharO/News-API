const axios = require('axios');
const xml2js = require('xml2js');

async function getStations(page = 1) {
  const perPage = 10;
  const url = `http://de1.api.radio-browser.info/xml/stations/topvote/${(page - 1) * perPage}/${perPage}`;

  try {
    const response = await axios.get(url);
    const result = await xml2js.parseStringPromise(response.data, { mergeAttrs: true });
    const stations = result.stationlist.station.map(station => ({
      name: station.name[0],
      url_resolved: station.url_resolved[0],
      country: station.country[0],
      language: station.language[0],
    }));
    return stations;
  } catch (error) {
    throw new Error(`Failed to fetch stations: ${error.message}`);
  }
}

module.exports = getStations;
