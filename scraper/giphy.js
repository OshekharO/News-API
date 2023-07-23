const axios = require('axios');

const apiKey = 'cV0tlNG65o5QnWVuGhhVMafKo3BpeeHT';

async function getGifs(searchQuery, page = 1) {
  const limit = 10;
  const offset = (page - 1) * limit;

  const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(searchQuery)}&limit=${limit}&offset=${offset}`;
  
  try {
    const response = await axios.get(url);
    const gifs = response.data.data.map(gif => ({
      title: gif.title,
      images: {
        gif_url: gif.images.original.url.replace(/media[0-4].giphy.com/g, 'i.giphy.com'),
        mp4: gif.images.original.mp4.replace(/media[0-4].giphy.com/g, 'i.giphy.com'),
  }
    }));
    return gifs;
  } catch (error) {
    throw new Error(`Failed to fetch GIFs: ${error.message}`);
  }
}

module.exports = getGifs;
