# News API

This is a simple server that serves as a unified API endpoint for fetching news from different sources. Currently, it supports AnimeNewsNetwork, Inshorts and some other sources.

The server is built using Node.js and Express and is hosted on Vercel.

## Endpoints

- `https://news-api.cyclic.app`

## Response

The server responds with a JSON object containing the news data. The structure of the data varies depending on the source.

For AnimeNewsNetwork, the data includes title, topics, preview, url, and thumbnail. For Inshorts, the data includes title, subtitle, content, sourceUrl, imageUrl, and other fields.

## Usage

You can use this server as a backend for a news app or website. Simply send a GET request to the appropriate endpoint to fetch news from that source.

Example using JavaScript's fetch API to fetch news from AnimeNewsNetwork:

```javascript
fetch('https://news-api-six-navy.vercel.app/api/news/ann')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Acknowledgements

- OpenAI GPT-4: for code review and suggestions
