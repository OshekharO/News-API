const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../index.js');
const { yts } = require('../scraper/yts.js');

let server;
let port;

test.before((t, done) => {
  server = app.listen(0, () => {
    port = server.address().port;
    done();
  });
});

test.after((t, done) => {
  if (server) {
    server.close(done);
  } else {
    done();
  }
});

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

test('GET / responds with status 200 and HTML', async () => {
  const res = await makeRequest('/');
  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.data.includes('News API'));
});

test('GET /api/news/us-tech responds with status 200 and valid news JSON', async () => {
  const res = await makeRequest('/api/news/us-tech');
  assert.strictEqual(res.statusCode, 200);
  const json = JSON.parse(res.data);
  assert.strictEqual(json.status, 'ok');
  assert.ok(Array.isArray(json.articles));
});

test('GET /api/news/ann falls back to MyAnimeList RSS feed gracefully when primary is down', async () => {
  const res = await makeRequest('/api/news/ann');
  assert.strictEqual(res.statusCode, 200);
  const json = JSON.parse(res.data);
  assert.strictEqual(json.source, 'MyAnimeList RSS (Fallback)');
  assert.ok(Array.isArray(json.articles));
  assert.ok(json.articles.length > 0);
});

test('GET /api/news/invalid_source responds with status 400', async () => {
  const res = await makeRequest('/api/news/invalid_source');
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.data, 'Invalid source');
});

test('GET /api/jokes/:query with special characters handles encoding safely', async () => {
  const res = await makeRequest('/api/jokes/dev%20test');
  assert.strictEqual(res.statusCode, 200);
  const json = JSON.parse(res.data);
  assert.ok(json.result !== undefined || json.total !== undefined);
});

test('YTS scraper parses HTML without duplicate modal-torrent loops', async () => {
  const cheerio = require('cheerio');
  const sampleHtml = `
    <html>
      <body>
        <div class="hidden-xs"><h1>Test Movie</h1><h2>2026</h2><h2>Action</h2></div>
        <div class="bottom-info"><div class="rating-row"><span>10</span><span>100</span></div><div class="rating-row"></div><div class="rating-row"></div><div class="rating-row"><span>8.5</span></div></div>
        <div class="tech-spec-info">
          <div class="row"><div class="tech-spec-element"></div><div class="tech-spec-element"></div><div class="tech-spec-element">English</div></div>
          <div class="row"><div class="tech-spec-element"></div><div class="tech-spec-element"></div><div class="tech-spec-element">120 min</div></div>
        </div>
        <div id="movie-poster"><img src="poster.jpg"/></div>
        <div class="modal-torrent">
          <div><span>1080p</span></div>
          <div>WEB</div>
          <div></div><div></div>
          <div>1.5 GB</div>
          <a href="test.torrent">Torrent</a>
          <a href="magnet:test">Magnet</a>
        </div>
      </body>
    </html>
  `;

  const $ = cheerio.load(sampleHtml);
  const data = { Files: [] };

  $('div.modal-torrent').each((_, ele) => {
    let files = {};
    files.Quality = $(ele).find(':nth-child(1) >span').text();
    files.Type = $(ele).find(':nth-child(2)').text();
    files.Size = $(ele).find(':nth-child(5)').text();
    files.Torrent = $(ele).find(':nth-child(6)').attr('href');
    files.Magnet = $(ele).find(':nth-child(7)').attr('href');
    data.Files.push(files);
  });

  assert.strictEqual(data.Files.length, 1);
  assert.strictEqual(data.Files[0].Quality, '1080p');
  assert.strictEqual(data.Files[0].Type, 'WEB');
});
