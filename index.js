const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
// Import your scraper function
const { pirateBay } = require('./scraper/pirateBay');
const { torrent1337x } = require('./scraper/1337x');
const { nyaaSI } = require('./scraper/nyaaSI');
const { yts } = require('./scraper/yts');
// API keys and index
const API_KEYS = ['rmt7lFVU2HTrio72Ej6F9t4AE6fnpuYSlOrXhjX50Q8', 'P3BRAgk3JTlgCj4BbHpsIrOBleKSEttzA2HOwDglfrk'];
let currentKeyIndex = 0;

const app = express();
const port = 3000;

// Enable All CORS Requests
app.use(cors());

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>News API</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
      <style>
      </style>
    </head>
    <body>
      <div class="container mt-5">
        <h1 class="badge badge-primary text-wrap mx-auto text-center">Welcome to the News API!</h1>
        <h2 class="mt-4 text-center">Available Endpoints:</h2>
        <ul class="list-group mt-3 font-monospace">
          <li class="list-group-item"><a href="/api/news/ann">/api/news/ann</a> - Fetches news from AnimeNewsNetwork</li>
          <li class="list-group-item"><a href="/api/news/inshorts">/api/news/inshorts</a> - Fetches news from Inshorts. Use ?query= to search for news.</li>
          <li class="list-group-item"><a href="/api/news/us-tech">/api/news/us-tech</a> - Fetches top headlines in the technology category from the US</li>
          <li class="list-group-item"><a href="/api/news/in-tech">/api/news/in-tech</a> - Fetches top headlines in the technology category from India</li>
          <li class="list-group-item"><a href="/api/torrent/piratebay/avengers/1">/api/torrent/piratebay/:query/:page?</a> - Fetches torrents data from PirateBay. Replace piratebay with yts, nyaasi or 1337x. Replace :query with your search query. :page is optional and defaults to 1.</li>
        </ul>
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

  // Update the key index, and reset to 0 if it's out of bounds
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  
  try {
    const currentKey = API_KEYS[currentKeyIndex];
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
