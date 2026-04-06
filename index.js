const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const axios = require('axios');
// Import your scraper function
const { pirateBay } = require('./scraper/pirateBay');
const { torrent1337x } = require('./scraper/1337x');
const { nyaaSI } = require('./scraper/nyaaSI');
const { yts } = require('./scraper/yts');
const scrapePixiv = require('./scraper/pixiv');
const getRingtones = require('./scraper/ringtone');
const getGifs = require('./scraper/giphy');

const app = express();
const port = 3000;

// Enable All CORS Requests
app.use(cors());

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>News API</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" href="https://i.imgur.com/38RT99Z.jpg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0d0d0f;
      --surface: #18181b;
      --surface2: #1f1f23;
      --border: #2a2a2e;
      --accent: #6366f1;
      --accent-soft: rgba(99,102,241,0.12);
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --green: #22c55e;
      --tag-news: #f59e0b;
      --tag-torrent: #3b82f6;
      --tag-extra: #a855f7;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 2rem 1rem 4rem;
    }

    /* ── Header ── */
    header {
      text-align: center;
      max-width: 640px;
      margin: 0 auto 3rem;
    }
    header h1 {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #fff 30%, var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }
    header p {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 1.25rem;
    }
    .base-urls {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
    }
    .base-url-chip {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 0.3rem 0.85rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--text-muted);
      cursor: pointer;
      transition: border-color 0.15s, color 0.15s;
      user-select: all;
    }
    .base-url-chip:hover { border-color: var(--accent); color: var(--text); }

    /* ── Layout ── */
    .container { max-width: 1100px; margin: 0 auto; }

    .section { margin-bottom: 2.5rem; }
    .section-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1rem;
      padding-bottom: 0.6rem;
      border-bottom: 1px solid var(--border);
    }
    .section-icon { font-size: 1.1rem; }
    .section-header h2 {
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }
    .tag {
      margin-left: auto;
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.2rem 0.55rem;
      border-radius: 999px;
    }
    .tag-news    { background: rgba(245,158,11,0.15); color: var(--tag-news); }
    .tag-torrent { background: rgba(59,130,246,0.15); color: var(--tag-torrent); }
    .tag-extra   { background: rgba(168,85,247,0.15); color: var(--tag-extra); }

    /* ── Cards grid ── */
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 0.75rem;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem 1.1rem;
      transition: border-color 0.15s, background 0.15s;
    }
    .card:hover { border-color: var(--accent); background: var(--surface2); }

    .card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .method-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      background: var(--accent-soft);
      color: var(--accent);
      flex-shrink: 0;
      margin-top: 0.1rem;
    }
    .endpoint {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: var(--text);
      word-break: break-all;
      flex: 1;
      cursor: pointer;
    }
    .endpoint:hover { color: var(--accent); }
    .copy-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      padding: 0.1rem 0.25rem;
      border-radius: 4px;
      font-size: 0.8rem;
      flex-shrink: 0;
      transition: color 0.15s, background 0.15s;
    }
    .copy-btn:hover { color: var(--text); background: var(--surface2); }

    .card-desc {
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* ── Toast ── */
    #toast {
      position: fixed;
      bottom: 1.5rem;
      left: 50%;
      transform: translateX(-50%) translateY(2rem);
      background: var(--surface2);
      border: 1px solid var(--border);
      color: var(--text);
      font-size: 0.82rem;
      padding: 0.5rem 1.1rem;
      border-radius: 999px;
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
      pointer-events: none;
      white-space: nowrap;
    }
    #toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* ── Footer ── */
    footer {
      text-align: center;
      color: var(--text-muted);
      font-size: 0.78rem;
      margin-top: 3rem;
    }
    footer a { color: var(--accent); text-decoration: none; }
    footer a:hover { text-decoration: underline; }

    @media (max-width: 480px) {
      .cards { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>

<header>
  <h1>&#9889; News API</h1>
  <p>A unified REST API for news, torrents, lyrics, GIFs, and more.</p>
  <div class="base-urls">
    <span class="base-url-chip" onclick="copyText('https://news-api-mocha.vercel.app')">news-api-mocha.vercel.app</span>
    <span class="base-url-chip" onclick="copyText('https://news-api-czsp.onrender.com')">news-api-czsp.onrender.com</span>
  </div>
</header>

<div class="container">

  <!-- News -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">&#128240;</span>
      <h2>News</h2>
      <span class="tag tag-news">4 endpoints</span>
    </div>
    <div class="cards">
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/news/ann')">/api/news/ann</span>
          <button class="copy-btn" onclick="copyText('/api/news/ann')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Latest news from Anime News Network.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/news/inshorts?query=...')">/api/news/inshorts</span>
          <button class="copy-btn" onclick="copyText('/api/news/inshorts')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">News from Inshorts. Add <code>?query=</code> to search.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/news/us-tech')">/api/news/us-tech</span>
          <button class="copy-btn" onclick="copyText('/api/news/us-tech')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Top US technology headlines.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/news/in-tech')">/api/news/in-tech</span>
          <button class="copy-btn" onclick="copyText('/api/news/in-tech')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Top India technology headlines.</p>
      </div>
    </div>
  </div>

  <!-- Torrents -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">&#129345;</span>
      <h2>Torrents</h2>
      <span class="tag tag-torrent">4 endpoints</span>
    </div>
    <div class="cards">
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/torrent/piratebay/:query/:page?')">/api/torrent/piratebay/:query/:page?</span>
          <button class="copy-btn" onclick="copyText('/api/torrent/piratebay/:query/:page?')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Search torrents on The Pirate Bay.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/torrent/1337x/:query/:page?')">/api/torrent/1337x/:query/:page?</span>
          <button class="copy-btn" onclick="copyText('/api/torrent/1337x/:query/:page?')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Search torrents on 1337x.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/torrent/nyaasi/:query/:page?')">/api/torrent/nyaasi/:query/:page?</span>
          <button class="copy-btn" onclick="copyText('/api/torrent/nyaasi/:query/:page?')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Search anime torrents on Nyaa.si.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/torrent/yts/:query/:page?')">/api/torrent/yts/:query/:page?</span>
          <button class="copy-btn" onclick="copyText('/api/torrent/yts/:query/:page?')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Search movies on YTS.</p>
      </div>
    </div>
  </div>

  <!-- Additional -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">&#10024;</span>
      <h2>Additional</h2>
      <span class="tag tag-extra">9 endpoints</span>
    </div>
    <div class="cards">
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/pixiv/:query/:page?')">/api/pixiv/:query/:page?</span>
          <button class="copy-btn" onclick="copyText('/api/pixiv/:query/:page?')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Artworks from Pixiv. <code>:page</code> defaults to 1.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/genius/:query')">/api/genius/:query</span>
          <button class="copy-btn" onclick="copyText('/api/genius/:query')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Song lyrics and metadata from Genius.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/giphy/:query/:page?')">/api/giphy/:query/:page?</span>
          <button class="copy-btn" onclick="copyText('/api/giphy/:query/:page?')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">GIFs from Giphy. <code>:page</code> defaults to 1.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/ringtone/:query')">/api/ringtone/:query</span>
          <button class="copy-btn" onclick="copyText('/api/ringtone/:query')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Ringtones from MusikRingtone.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/memes')">/api/memes</span>
          <button class="copy-btn" onclick="copyText('/api/memes')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Popular meme templates from Imgflip.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/person/:num?')">/api/person/:num?</span>
          <button class="copy-btn" onclick="copyText('/api/person/:num?')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Random generated person details. <code>:num</code> defaults to 1.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/slok/:ch?/:sl?')">/api/slok/:ch?/:sl?</span>
          <button class="copy-btn" onclick="copyText('/api/slok/:ch?/:sl?')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Bhagavad Gita shloka. <code>:ch</code> and <code>:sl</code> default to 1.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/ifsc/:ifsc')">/api/ifsc/:ifsc</span>
          <button class="copy-btn" onclick="copyText('/api/ifsc/:ifsc')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Indian bank details by IFSC code.</p>
      </div>
      <div class="card">
        <div class="card-top">
          <span class="method-badge">GET</span>
          <span class="endpoint" onclick="copyText('/api/jokes/:query')">/api/jokes/:query</span>
          <button class="copy-btn" onclick="copyText('/api/jokes/:query')" title="Copy">&#128203;</button>
        </div>
        <p class="card-desc">Jokes from Chuck Norris API by category.</p>
      </div>
    </div>
  </div>

</div>

<footer>
  <p>All endpoints return JSON &mdash; <a href="https://github.com/OshekharO/News-API" target="_blank">GitHub</a></p>
</footer>

<div id="toast">Copied!</div>

<script>
  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => showToast('Copied!')).catch(() => showToast('Copy failed'));
  }
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 1800);
  }
</script>
</body>
</html>`);
});

// Torrent routes
app.get('/api/torrent/piratebay/:query/:page?', createScrapeRoute(pirateBay));
app.get('/api/torrent/1337x/:query/:page?', createScrapeRoute(torrent1337x));
app.get('/api/torrent/nyaasi/:query/:page?', createScrapeRoute(nyaaSI));
app.get('/api/torrent/yts/:query/:page?', createScrapeRoute(yts));

// Generic function to handle scraping requests
function createScrapeRoute(scraperFunction) {
  return async (req, res) => {
    const { query, page = 1 } = req.params;
    try {
      const data = await scraperFunction(query, page);
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'An error occurred while scraping torrents data.' });
    }
  };
}

// Pixiv route
app.get('/api/pixiv/:query/:page?', async (req, res) => {
    const { query, page } = req.params;
    try {
        const artworks = await scrapePixiv(query, page);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
        res.json({
            success: true,
            query: query,
            page: parseInt(page) || 1,
            results: artworks,
            count: artworks.length
        });
    } catch (error) {
        console.error('Pixiv API error:', error);
        res.status(500).json({ 
            error: error.message,
            success: false 
        });
    }
});

app.get('/api/giphy/:query/:page?', async (req, res) => {
  const { query, page } = req.params;

  try {
    const gifs = await getGifs(query, page);
    let data = JSON.stringify(gifs, null, 2);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

app.get('/api/ringtone/:query', async (req, res) => {
  const { query } = req.params;

  try {
    const ringtones = await getRingtones(query);
    let data = JSON.stringify(ringtones, null, 2);
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/api/person/:num?', async (req, res) => {
  try {
    const num = req.params.num || 1;
    const url = `https://peoplegeneratorapi.live/api/person/${num}`;

    const response = await axios.get(url);
    const prettyJson = JSON.stringify(response.data, null, 2);

    res.setHeader('Content-Type', 'application/json');
    res.send(prettyJson);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

app.get('/api/memes', async (req, res) => {
  try {
    const response = await axios.get('https://api.imgflip.com/get_memes');
    let data = response.data;
    data = JSON.stringify(data, null, 2);
    data = data.replace(/\\\//g, '/');

    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

app.get('/api/slok/:ch?/:sl?', async (req, res) => {
    const chapter = req.params.ch || '1';
    const sloka = req.params.sl || '1';
    try {
        const response = await axios.get(`https://bhagavadgitaapi.in/slok/${chapter}/${sloka}`);
        const prettyJson = JSON.stringify(response.data, null, 2);
        res.setHeader('Content-Type', 'application/json');
        res.send(prettyJson);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
});

app.get('/api/jokes/:query', async (req, res) => {
  try {
    const response = await axios.get(`https://api.chucknorris.io/jokes/search?query=${req.params.query}`);
    const prettyJson = JSON.stringify(response.data, null, 2);
    res.setHeader('Content-Type', 'application/json');
    res.send(prettyJson);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

app.get('/api/ifsc/:ifsc', async (req, res) => {
  try {
    const ifsc = req.params.ifsc;
    const url = `https://bank-apis.justinclicks.com/API/V1/IFSC/${ifsc}`;

    const response = await axios.get(url);
    const prettyJson = JSON.stringify(response.data, null, 2);

    res.setHeader('Content-Type', 'application/json');
    res.send(prettyJson);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Server error');
  }
});

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

const fetchNews = (category, country, res) => {
  fetch(`https://saurav.tech/NewsAPI/top-headlines/category/${category}/${country}.json`)
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: err.toString() }));
};

app.get('/api/news/us-tech', (req, res) => {
  fetchNews('technology', 'us', res);
});

app.get('/api/news/in-tech', (req, res) => {
  fetchNews('technology', 'in', res);
});

app.get('/api/news/:source', async (req, res) => {
  const { source } = req.params;
  const { query } = req.query; 

  const sourceToUrlMap = {
    ann: 'https://api.fl-anime.com/news/ann/recent-feeds',
    inshorts: query 
        ? `https://inshorts.vercel.app/news/search?query=${query}&offset=0&limit=10`
        : 'https://inshorts.vercel.app/news/all?offset=0&limit=10'
  };

  if (!sourceToUrlMap.hasOwnProperty(source)) {
    return res.status(400).send('Invalid source');
  }

  try {
    const response = await fetch(sourceToUrlMap[source]);
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

module.exports = app;
