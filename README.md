# Rustlesearch

Rustlesearch is a a web app for complex searching of years of Twitch.tv chat logs.

With over 4.3 billion messages indexed, and millions more each day, this is the best way to filter chat history by channel, username, body text and date.

## How was Rustlesearch built?

A project called [OverRustleLogs](https://overrustlelogs.net) has collected full chat logs for hundreds of channels over the past 5 years. This project is amazing, however chat logs are stored in plaintext and are difficult to filter and search to find exactly what you're looking for.

Rustlesearch uses the logs provided by OverRustleLogs and indexes them into Elasticsearch to enable complex searching capabilities.

Rustlesearch is built around Elasticsearch, using a few different tools.

#### Backend

- Node.js
- Express.js with Clustering
- Nginx
- Docker

The backend API server acts as a middleman between the raw elasticsearch database and the frontend users. It provides a trimmed down query api, along with rate limiting to prevent abuse.

#### Frontend

- Vue.js
- Webpack
- TailwindCSS
- Netlify

The frontend application is built with Vue.js and TailwindCSS to provide a modern, fast experience. The client is small, with bloat carefully trimmed down. Further, we use Netlify to serve the client on a blazing fast CDN.

#### Scripts/Tooling

- Node.js
- Worker threads
- Node Streams

The scripts and tooling for rustlesearch are optimized for fast and resiliant performance. The indexing script, which is used to transform and ingest raw plaintext files of chat messages into elasticsearch, uses multithreading via worker threads and node streams to achieve a high throughput.

The scripts utilize a set of caching files to make indexing and downloading resilient to interruption, for example gracefully exiting indexing and writing all finished processes to a cache to guarantee they aren't indexed again.

## Contributors

- johnpyp
- alg1142
