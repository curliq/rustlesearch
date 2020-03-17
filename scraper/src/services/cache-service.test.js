/* eslint-disable no-param-reassign */
const fs = require("fs-extra");
const nock = require("nock");
const test = require("ava");
const zlib = require("zlib");
const { promisify } = require("util");
const { dayjs } = require("../util");
const CacheService = require("./cache-service");

const deflate = promisify(zlib.deflate);

const dir = "mock-data";

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
  .reply(200, ["January 2014", "August 2013"])
  .get(encodeURI("/api/v1/Xqcow/months.json"))
  .reply(200, ["January 2014"])
  .get(encodeURI("/Xqcow chatlog/January 2020/2020-01-02.txt"))
  .reply(404)
  .persist();

test.beforeEach(t => {
  t.context.cacheService = CacheService({ fileService: { dir } });
});
test.serial.afterEach.always(async () => {
  await fs.remove(dir);
});

test.serial("integration: downloads log properly", async t => {
  const fpath = `${dir}/compressed/Destiny::2020-01-02.txt.zz`;
  const text = await t.context.cacheService.fetchLogCached({
    channel: "Destiny",
    day: dayjs("2020-01-02"),
  });
  t.is(text, destinyData);
  const logExists = await fs.pathExists(fpath);
  t.true(logExists);
});

test.serial("integration: reads cached log properly", async t => {
  const fpath = `${dir}/compressed/Destiny::2020-01-02.txt.zz`;
  await fs.outputFile(fpath, await deflate("meme data"));
  const text = await t.context.cacheService.fetchLogCached({
    channel: "Destiny",
    day: dayjs("2020-01-02"),
  });
  t.is(text, "meme data");
  const logExists = await fs.pathExists(fpath);
  t.true(logExists);
});

test.serial("integration: downloads missing log to cache", async t => {
  const text = await t.context.cacheService.fetchLogCached({
    channel: "Xqcow",
    day: dayjs("2020-01-02"),
  });
  t.is(text, null);
  const downloadCacheContents = await fs.readFile(`${dir}/download-cache.txt`, "utf8");
  t.is(downloadCacheContents.trim(), `Xqcow::2020-01-02.txt`);
});
