const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
// Import your scraper function
const { pirateBay } = require('./scraper/pirateBay');
const { torrent1337x } = require('./scraper/1337x');
const { nyaaSI } = require('./scraper/nyaaSI');
const { yts } = require('./scraper/yts');
// API keys for newscatcherapi and newsapi.org
const API_KEYS_NEWSCATCHER = ['rmt7lFVU2HTrio72Ej6F9t4AE6fnpuYSlOrXhjX50Q8', 'P3BRAgk3JTlgCj4BbHpsIrOBleKSEttzA2HOwDglfrk', 'UhEM6sCXRqA_ge-gfOiEXzAOAODhv9kB9WbFqk1clDg'];
const API_KEYS_NEWSAPI = ['cab817200f92426bacb4edd2373e82ef', '429904aa01f54a39a278a406acf50070', '28679d41d4454bffaf6a4f40d4b024cc', 'd9903836bbca401a856602f403802521', 'badecbdafe6a4be6a94086f2adfa9c06', '5fbf109857964643b73a2bc2540b36b6'];
let currentKeyIndexNewscatcher = 0;
let currentKeyIndexNewsApi = 0;
let requestCountNewscatcher = 0;
let requestCountNewsApi = 0;

const app = express();
const port = 3000;

// Enable All CORS Requests
app.use(cors());

app.get('/', (req, res) => {
  res.send(`
 <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News API</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-beta2/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
  <style>
    body {
      font-family: 'Poppins', sans-serif;
      background: #f5f5f5;
      color: #000;
    }
    h1, h2, h3 {
      color: #000;
    }
    .bg-neon {
      background-image: linear-gradient(#00ff00, #0000ff, #4b0082, #8f00ff);
      background-size: 300% 300%;
      -webkit-text-fill-color: transparent;
      -webkit-background-clip: text;
    }
    .card {
      border-radius: 15px;
      overflow: hidden;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255,255,255,0.5);
      border-left: 1px solid rgba(255,255,255,0.5);
      box-shadow: 5px 5px 15px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
      color: #000;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 5px 5px 15px rgba(0,0,0,0.4);
    }
    .endpoint {
      margin-left: 20px;
    }
  </style>
</head>
<body>
  <div class="container mt-5">
    <h1 class="text-center bg-neon">Welcome to News API!</h1>
    <h3 class="text-center mt-3">Your go-to source for latest news and data.</h3>

    <div class="row mt-5">
      <div class="col-md-8 offset-md-2">
        <div class="card p-4 mb-4">
          <h2><i class="fas fa-newspaper"></i> Available Endpoints:</h2>
          <hr class="my-3">
          <div class="endpoint mb-2"><i class="fas fa-angle-right"></i> <a href="/api/news/ann">/api/news/ann</a> - Fetches news from AnimeNewsNetwork.</div>
          <div class="endpoint mb-2"><i class="fas fa-angle-right"></i> <a href="/api/news/inshorts">/api/news/inshorts</a> - Fetches news from Inshorts. Use ?query= to search for news.</div>
          <div class="endpoint mb-2"><i class="fas fa-angle-right"></i> <a href="/api/news/us-tech">/api/news/us-tech</a> - Fetches top headlines in the technology category from the US.</div>
          <div class="endpoint mb-2"><i class="fas fa-angle-right"></i> <a href="/api/news/in-tech">/api/news/in-tech</a> - Fetches top headlines in the technology category from India.</div>
          <div class="endpoint mb-2"><i class="fas fa-angle-right"></i> <a href="/api/torrent/piratebay/:query/1">/api/torrent/piratebay/:query/:page?</a> - Fetches torrents data. Replace piratebay with yts, nyaasi or 1337x. Replace :query with your search query. :page is optional and defaults to 1.</div>
          <div class="endpoint mb-2"><i class="fas fa-angle-right"></i> <a href="/api/genius/:query">/api/genius/:query</a> - Fetches data from Genius API.</div>
          <div class="endpoint mb-2"><i class="fas fa-angle-right"></i> <a href="/api/newscatcher/:query">/api/newscatcher/:query</a> - Fetches data from Newscatcher API.</div>
          <div class="endpoint mb-2"><i class="fas fa-angle-right"></i> <a href="/api/newsapi/:query">/api/newsapi/:query</a> - Fetches data from NewsApi.</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `);
});

app.get('/api/torrent/piratebay/:query/:page?', async (req, res) => {
  const { query, page = 1 } = req.params;
  handleScrapingRequest(pirateBay, query, page, res);
});

app.get('/api/torrent/1337x/:query/:page?', async (req, res) => {
  const { query, page = 1 } = req.params;
  handleScrapingRequest(torrent1337x, query, page, res);
});

app.get('/api/torrent/nyaasi/:query/:page?', async (req, res) => {
  const { query, page = 1 } = req.params;
  handleScrapingRequest(nyaaSI, query, page, res);
});

app.get('/api/torrent/yts/:query/:page?', async (req, res) => {
  const { query, page = 1 } = req.params;
  handleScrapingRequest(yts, query, page, res);
});

// Generic function to handle scraping requests
async function handleScrapingRequest(scraperFunction, query, page, res) {
  try {
    // Use the scraper function instead of fetching the API
    const data = await scraperFunction(query, page);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while scraping torrents data.' });
  }
}

app.get('/api/genius/:query', async (req, res) => {
  const { query } = req.params;
  try {
    const response = await fetch(`https://genius.com/api/search/multi?per_page=1&q=${query}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while fetching data from Genius.' });
  }
});

app.get('/api/newscatcher/:query', async (req, res) => {
  const { query } = req.params;

  // Update the request count
  requestCountNewscatcher++;

  // If we've made 50 requests with the current key, move on to the next one
  if (requestCountNewscatcher >= 50) {
    currentKeyIndexNewscatcher = (currentKeyIndexNewscatcher + 1) % API_KEYS_NEWSCATCHER.length;
    requestCountNewscatcher = 0;  // Reset the request count
  }

  try {
    const currentKey = API_KEYS_NEWSCATCHER[currentKeyIndexNewscatcher];
    console.log(`Using key: ${currentKey}`);  // Log the current key

    const response = await fetch(`https://api.newscatcherapi.com/v2/search?q=${query}`, {
      headers: {
        'x-api-key': currentKey
      }
    });
    
    console.log(`Response status: ${response.status}`);  // Log the response status

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while fetching data from Newscatcher.' });
  }
});

app.get('/api/newsapi/:query', async (req, res) => {
  const { query } = req.params;

  // Update the request count
  requestCountNewsApi++;

  // If we've made 100 requests with the current key, move on to the next one
  if (requestCountNewsApi >= 100) {
    currentKeyIndexNewsApi = (currentKeyIndexNewsApi + 1) % API_KEYS_NEWSAPI.length;
    requestCountNewsApi = 0;  // Reset the request count
  }

  try {
    const currentKey = API_KEYS_NEWSAPI[currentKeyIndexNewsApi];
    console.log(`Using key: ${currentKey}`);  // Log the current key

    const response = await fetch(`https://newsapi.org/v2/everything?q=${query}&apiKey=${currentKey}`);
    
    console.log(`Response status: ${response.status}`);  // Log the response status

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while fetching data from NewsAPI.' });
  }
});

// Route for getting technology news in the US
app.get('/api/news/us-tech', (req, res) => {
  fetch('https://saurav.tech/NewsAPI/top-headlines/category/technology/us.json')
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: err.toString() }));
});

// Route for getting technology news in India
app.get('/api/news/in-tech', (req, res) => {
  fetch('https://saurav.tech/NewsAPI/top-headlines/category/technology/in.json')
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: err.toString() }));
});

app.get('/api/news/:source', async (req, res) => {
  const { source } = req.params;
  const { query } = req.query; // Access query parameter from the request

  let url;
  if (source === 'ann') {
    url = 'https://api.consumet.org/news/ann/recent-feeds';
  } else if (source === 'inshorts') {
    if(query) {
      url = `https://inshorts.me/news/search?query=${query}&offset=0&limit=20`;
    } else {
      url = 'https://inshorts.me/news/all?offset=0&limit=20';
    }
  } else {
    return res.status(400).send('Invalid source');
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

module.exports = app; // Export your app
