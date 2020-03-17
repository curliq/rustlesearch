const test = require("ava");
const { Client } = require("@elastic/elasticsearch");
const { dayjs, sleep } = require("../util");
const ElasticsearchService = require("./elasticsearch-service");

const testClient = new Client({
  node: "http://localhost:9200",
});
const elasticsearchService = ElasticsearchService({
  elastic: {
    index: "rustlesearch",
    pipeline: "rustlesearch-pipeline",
    bulkSize: 1,
    url: "http://localhost:9200",
  },
});

test("elasticsearchMsgNorm normalizes message correctly", t => {
  const normMsg = elasticsearchService.normalizer({
    channel: "DESTINY",
    username: "superMEMER",
    text: "some cool text",
    ts: dayjs("2020-03-01 05:20:02").utc(),
  });
  t.deepEqual(normMsg, {
    channel: "Destiny",
    username: "supermemer",
    text: "some cool text",
    ts: "2020-03-01T10:20:02.000Z",
  });
});

test.serial.beforeEach(async () => {
  await testClient.indices.delete({
    index: "rustlesearch-*",
  });
});

test.serial.afterEach.always(async () => {
  await testClient.indices.delete({
    index: "rustlesearch-*",
  });
});

test.serial("integration: writeStream indexes to elasticsearch properly", async t => {
  await elasticsearchService.messageWrite({
    channel: "DESTINY",
    username: "superMEMER",
    text: "some cool text",
    ts: dayjs("2020-02-04 05:20:02").utc(),
  });
  await elasticsearchService.messageWrite({
    channel: "DestinyGG",
    username: "Harkdan",
    text: "some cool text",
    ts: dayjs("2019-01-04 12:20:02").utc(),
  });
  await sleep(1000);
  const { body: message1 } = await testClient.get({
    id: "Destiny-supermemer-2020-02-04T10:20:02.000Z",
    index: "rustlesearch-2020-02-01",
  });
  t.deepEqual(message1._source, {
    channel: "Destiny",
    text: "some cool text",
    username: "supermemer",
    ts: "2020-02-04T10:20:02.000Z",
  });
  const { body: message2 } = await testClient.get({
    id: "Destinygg-harkdan-2019-01-04T17:20:02.000Z",
    index: "rustlesearch-2019-01-01",
  });
  t.deepEqual(message2._source, {
    channel: "Destinygg",
    text: "some cool text",
    username: "harkdan",
    ts: "2019-01-04T17:20:02.000Z",
  });
});
