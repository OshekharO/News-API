const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

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
        </ul>
      </div>
    </body>
    </html>
  `);
});

app.get('/api/torrents/:query/:page?', async (req, res) => {
  const { query, page = 1 } = req.params;

  try {
    const response = await fetch(`https://torrents-api.ryukme.repl.co/api/nyaasi/${query}/${page}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while fetching torrents data.' });
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
