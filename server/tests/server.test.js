const { range } = require("ramda");
const request = require("supertest");
const Promise = require("bluebird");
const { Client } = require("@elastic/elasticsearch");
const app = require("../src");
const config = require("../src/config");

const getManyRequests = (count, url, query) =>
  range(0, count).map(() =>
    request(app)
      .get(url)
      .query(query),
  );

const client = new Client({
  node: config.elastic.url,
});

// const sleep = ms => new Promise(resolve => setTimeout(resolve(), ms));

beforeAll(async () => {
  await client.indices.putTemplate({
    body: {
      index_patterns: `${config.elastic.index}*`,
      mappings: {
        properties: {
          channel: { type: "keyword" },
          text: { type: "text" },
          ts: { type: "date" },
          username: { type: "keyword" },
        },
      },
      settings: {
        number_of_replicas: 0,
        number_of_shards: 1,

        "sort.field": "ts",
        "sort.order": "desc",
      },
    },
    name: "rustlesearch-template",
  });

  await client.ingest.putPipeline({
    body: {
      description: "monthly date-time index naming",
      processors: [
        {
          date_index_name: {
            date_rounding: "M",
            field: "ts",
            index_name_prefix: `${config.elastic.index}-`,
          },
        },
        {
          set: {
            field: "_id",
            value: "{{channel}}-{{username}}-{{ts}}",
          },
        },
      ],
    },
    id: "rustlesearch-pipeline",
  });
  // await sleep(300);
  // await client.index({
  //   index: "rustlesearch",
  //   body: {
  //     channel: "Destinygg",
  //     text: "meme",
  //     ts: "2019-02-31T15:14:12Z",
  //     username: "epicgamermemer",
  //   },
  //   pipeline: "rustlesearch-pipeline",
  // });
});

describe("server test", () => {
  test("healthcheck passes", async () => {
    const response = await request(app).get("/healthcheck");
    expect(response.statusCode).toBe(200);
  });

  test("empty queries get rejected", async () => {
    const response = await request(app).get("/search");
    expect(response.statusCode).toBe(422);
  });

  test("we can query something", async () => {
    const response = await request(app)
      .get("/search")
      .query({ channel: "destinygg" });

    expect(response.statusCode).toBe(200);
  });

  test("the ratelimiter works", async done => {
    const requests = getManyRequests(20, "/search", {
      channel: "destinygg",
    });

    const isTimedOut = response =>
      response.statusCode === 429 ? done() : response;

    // at least one should throw a 429
    const results = await Promise.all(requests);
    results.forEach(response => isTimedOut(response));
  });

  test("we can get the channels", async done => {
    const { body } = await request(app).get("/channels");

    if (Array.isArray(body.channels)) return done();
    throw new Error("/channels does not return an array");
  });
});
