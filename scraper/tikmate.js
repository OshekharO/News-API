// in tikmate.js
const axios = require('axios');

async function tikmateApp(url) {
    const { data } = await axios.post('https://api.tikmate.app/api/lookup',
        { url: url },
        {
            headers: {
                referer: 'https://tikmate.app',
                'Content-Type': 'application/json',
            },
        })
    return {
        ...data,
        videoUrl: `https://tikmate.app/download/${data.token}/${data.id}.mp4`,
        videoUrlHd: `https://tikmate.app/download/${data.token}/${data.id}.mp4?hd=1`,
    }
}
