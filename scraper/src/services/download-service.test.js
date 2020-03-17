/* eslint-disable no-param-reassign */
const test = require("ava");
const nock = require("nock");

const { dayjs } = require("../util");
const DownloadService = require("./download-service");

const targetObject = { channel: "Destiny", day: dayjs("2020/01/02 05:40").utc() };

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
  .reply(200, ["January 2017", "August 2016"])
  .persist();

test.beforeEach(t => {
  t.context.downloadService = DownloadService();
});
test("buildLogUrl builds correct url", t => {
  const url = t.context.downloadService.buildLogUrl(targetObject);
  t.is(url, "https://overrustlelogs.net/Destiny chatlog/January 2020/2020-01-02.txt");
});

test("buildMonthsUrl builds correct url", t => {
  const url = t.context.downloadService.buildMonthsUrl("Destiny");
  t.is(url, "https://overrustlelogs.net/api/v1/Destiny/months.json");
});

test.serial("integration: downloads file text", async t => {
  const text = await t.context.downloadService.downloadLog(targetObject);
  t.is(text, destinyData);
});

test.serial("integration: downloads month json", async t => {
  const text = await t.context.downloadService.downloadMonths("Destiny");
  t.deepEqual(text, ["January 2014", "August 2013"]);
});
