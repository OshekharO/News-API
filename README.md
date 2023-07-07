# News API

This is a simple server that serves as a unified API endpoint for fetching news from different sources. Currently, it supports AnimeNewsNetwork, Inshorts and some other sources.

The server is built using Node.js and Express and is hosted on Vercel.

## Endpoints

There are two endpoints available:

1. `/api/news/ann` - Fetches news from AnimeNewsNetwork.
   * Example: `https://news-api-six-navy.vercel.app/api/news/ann`
   
2. `/api/news/inshorts` - Fetches news from Inshorts. You can also provide a query parameter to search for news.
   * Example: `https://news-api-six-navy.vercel.app/api/news/inshorts?query=covid`
  
3. `/api/news/in-tech` - Fetches top headlines in the technology category from the india.
   * Example: `https://news-api-six-navy.vercel.app/api/news/in-tech`

4. `/api/news/us-tech` - Fetches top headlines in the technology category from the US.
   * Example: `https://news-api-six-navy.vercel.app/api/news/us-tech`
  
5. `/api/torrent/:website/:query/:page?` - Fetches torrents data from PirateBay. Replace piratebay with yts, nyaasi or 1337x. Replace :query with your search query. :page is optional and defaults to 1.
   * Example: `https://news-api-six-navy.vercel.app/api/torrents/avengers/1`

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


