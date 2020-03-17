/* eslint-disable no-param-reassign */
const test = require("ava");
const fs = require("fs-extra");
const { Client } = require("@elastic/elasticsearch");

const nock = require("nock");
const R = require("ramda");
const ElasticsearchService = require("./elasticsearch-service");
const FileService = require("./file-service");
const CacheService = require("./cache-service");
const IntegrationService = require("./integration-service");
const { sleep, dayjs } = require("../util");

const destinyData = `
[2020-01-05 00:00:14 UTC] Jeroga: LeRuse
[2020-01-05 00:00:16 UTC] Tezzor: !song
[2020-01-05 00:00:16 UTC] Subscriber: middleclasswhite has resubscribed on Twitch!
[2020-01-05 00:00:16 UTC] SubscriberMessage: middleclasswhite said... Why didnt you heal steven?
`.trim();
nock("https://overrustlelogs.net")
  .get(encodeURI("/Destiny chatlog/January 2020/2020-01-02.txt"))
  .reply(200, destinyData)
  .get(encodeURI("/api/v1/Destiny/months.json"))
  .reply(200, ["January 2013"]);
const dir = "mock-data";
const cfg = {
  elastic: {
    index: "rustlesearch",
    pipeline: "rustlesearch-pipeline",
    bulkSize: 1,
    url: "http://localhost:9200",
  },
  fileService: {
    dir,
  },
};

const testClient = new Client({
  node: cfg.elastic.url,
});

test.serial.beforeEach(async t => {
  t.context.fileService = FileService(cfg);
  t.context.cacheService = CacheService(cfg);
  t.context.elasticsearchService = ElasticsearchService(cfg);
  t.context.integrationService = IntegrationService(cfg);
  await testClient.indices.delete({
    index: "rustlesearch-*",
  });
  await fs.remove(dir);
});

test.serial.afterEach.always(async () => {
  await fs.remove(dir);
});

test.serial("download historical logs and index them", async t => {
  await t.context.integrationService.indexLog({ channel: "Destiny", day: dayjs("2020-01-02") });
  await sleep(1000);
  const { body } = await testClient.search({ index: "rustlesearch-*" });
  const sortById = R.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  t.deepEqual(
    sortById(body.hits.hits.map(x => x._source)),
    sortById([
      {
        channel: "Destiny",
        text: "middleclasswhite has resubscribed on Twitch!",
        username: "subscriber",
        ts: "2020-01-05T00:00:16.000Z",
      },
      {
        channel: "Destiny",
        text: "!song",
        username: "tezzor",
        ts: "2020-01-05T00:00:16.000Z",
      },
      {
        channel: "Destiny",
        text: "LeRuse",
        username: "jeroga",
        ts: "2020-01-05T00:00:14.000Z",
      },
      {
        channel: "Destiny",
        text: "middleclasswhite said... Why didnt you heal steven?",
        username: "subscribermessage",
        ts: "2020-01-05T00:00:16.000Z",
      },
    ]),
  );
});
