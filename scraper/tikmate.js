const axios = require('axios');

exports.getInfo = async function(url) {
  try {
    const { data } = await axios.post('https://api.tikmate.app/api/lookup',
      'url=' + encodeURIComponent(url),
      {
        headers: {
          referer: 'https://tikmate.app',
        }
      });
    
    return {
      ...data,
      videoUrl: `https://tikmate.app/download/${data.token}/${data.id}.mp4`,
      videoUrlHd: `https://tikmate.app/download/${data.token}/${data.id}.mp4?hd=1`,
    };
  } catch (error) {
    throw error;
  }
};
