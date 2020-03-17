/* eslint-disable no-param-reassign */
const test = require("ava");
const fs = require("fs-extra");
const zlib = require("zlib");
const { promisify } = require("util");
const { dayjs } = require("../util");
const FileService = require("./file-service");

const inflate = promisify(zlib.inflate);

const dir = "mock-data";

const targetObject = { channel: "Destiny", day: dayjs("2020/01/02 05:40").utc() };

test.beforeEach(t => {
  t.context.fileService = FileService({ fileService: { dir } });
});
test("channel and day are are correctly converted to filename", t => {
  const filename = t.context.fileService.getLogFilename(targetObject);

  t.is(filename, "Destiny::2020-01-02.txt");
});
test("compressedLogPath correctly builds path", t => {
  const filepath = t.context.fileService.compressedLogPath(targetObject);

  t.is(filepath, `${dir}/compressed/Destiny::2020-01-02.txt.zz`);
});
test("uncompressedLogPath correctly builds path", t => {
  const filepath = t.context.fileService.uncompressedLogPath(targetObject);

  t.is(filepath, `${dir}/uncompressed/Destiny::2020-01-02.txt`);
});

test("messageToLogString works", t => {
  const msgString = t.context.fileService.messageToLogString({
    channel: "DESTiny",
    username: "mEMER",
    ts: dayjs("2020/01/02 05:40:03").utc(),
    text: "This is some text",
  });
  t.is(msgString, "[2020-01-02 10:40:03 UTC] memer: This is some text");
});

test.serial.afterEach.always(async () => {
  await fs.remove(dir);
});
test.serial.before(async () => {
  await fs.remove(dir);
});
test.serial("integration: compressedLogExists finds file", async t => {
  await fs.outputFile(`${dir}/compressed/Destiny::2020-01-02.txt.zz`, "memes");
  const v = await t.context.fileService.compressedLogExists(targetObject);
  t.true(v);
});
test.serial("integration: compressedLogExists does not find missing file", async t => {
  const v = await t.context.fileService.compressedLogExists(targetObject);
  t.false(v);
});

test.serial("integration: compressedLogExists does not find uncompressed file", async t => {
  await fs.outputFile(`${dir}/uncompressed/Destiny::2020-01-02.txt`, "memes");
  const v = await t.context.fileService.compressedLogExists(targetObject);
  t.false(v);
});

test.serial("integration: uncompressedLogExists finds file", async t => {
  await fs.outputFile(`${dir}/uncompressed/Destiny::2020-01-02.txt`, "memes");
  const v = await t.context.fileService.uncompressedLogExists(targetObject);
  t.true(v);
});

test.serial("integration: uncompressedLogExists does not find missing file", async t => {
  const v = await t.context.fileService.compressedLogExists(targetObject);
  t.false(v);
});

test.serial("integration: anywhereLogExists finds file in compressed", async t => {
  await fs.outputFile(`${dir}/compressed/Destiny::2020-01-02.txt.zz`, "memes");
  const v = await t.context.fileService.anywhereLogExists(targetObject);
  t.true(v);
});

test.serial("integration: anywhereLogExists finds file in uncompressed", async t => {
  await fs.outputFile(`${dir}/uncompressed/Destiny::2020-01-02.txt`, "memes");
  const v = await t.context.fileService.anywhereLogExists(targetObject);
  t.true(v);
});

test.serial("integration: anywhereLogExists does not find missing file", async t => {
  const v = await t.context.fileService.anywhereLogExists(targetObject);
  t.false(v);
});

test.serial("integration: compressedLogWrite writes missing file correctly compressed", async t => {
  const contents = "this is some meme contents";
  await t.context.fileService.compressedLogWrite(targetObject, contents);

  const compressedFileData = await fs.readFile(`${dir}/compressed/Destiny::2020-01-02.txt.zz`);
  const fileData = await inflate(compressedFileData);
  t.is(fileData.toString(), contents);
});

test.serial("integration: messageWrite correctly streams messages", async t => {
  await t.context.fileService.messageWrite({
    channel: "DestINY",
    ts: dayjs("2020/01/02 05:40:03").utc(),
    text: "This is a message1",
    username: "RAGEpope",
  });
  await t.context.fileService.messageWrite({
    channel: "DestINY",
    ts: dayjs("2020/01/02 05:41:03").utc(),
    text: "This is a message2",
    username: "anotheruser",
  });
  await t.context.fileService.messageWrite({
    channel: "DestINY",
    ts: dayjs("2020/01/02 13:42:03").utc(),
    text: "This is a message3",
    username: "memer",
  });
  await t.context.fileService.messageWrite({
    channel: "Destinygg",
    ts: dayjs("2020/01/01 14:42:03").utc(),
    text: "This is a message4",
    username: "memer",
  });

  const expected1 = `[2020-01-02 10:40:03 UTC] ragepope: This is a message1
[2020-01-02 10:41:03 UTC] anotheruser: This is a message2
[2020-01-02 18:42:03 UTC] memer: This is a message3`;
  const fileData1 = await fs.readFile(`${dir}/uncompressed/Destiny::2020-01-02.txt`, "utf8");
  t.is(fileData1.trim(), expected1.trim());

  const expected2 = `[2020-01-01 19:42:03 UTC] memer: This is a message4`;
  const fileData2 = await fs.readFile(`${dir}/uncompressed/Destinygg::2020-01-01.txt`, "utf8");
  t.is(fileData2.trim(), expected2.trim());
});
// const destinyData = `
// [2020-01-05 00:00:14 UTC] Jeroga: LeRuse
// [2020-01-05 00:00:16 UTC] Tezzor: !song
// [2020-01-05 00:00:16 UTC] Subscriber: middleclasswhite has resubscribed on Twitch!
// [2020-01-05 00:00:16 UTC] SubscriberMessage: middleclasswhite said... Why didnt you heal steven?
// `.trim();
// const xqcData = `
// [2020-01-05 00:00:04 UTC] dbd_e: empty
// [2020-01-05 00:00:04 UTC] ig_frezh: Sell the labs keycards on the flea market for 200k
// [2020-01-05 00:00:05 UTC] saartki: cmonBruh
// [2020-01-05 00:00:05 UTC] boobfart: ONE OF THEM ARE ONE OF THEM ARE ONE OF THEM ARE
// [2020-01-05 00:00:05 UTC] ayychance: @xQcOW YOU GOTTA FARM SCAV RUNS DUDE I'VE MADE OVER A MIL DOING IT TODAY
// `.trim();

// nock("https://overrustlelogs.net", { allowUnmocked: true })
//   .get("/api/v1/channels.json")
//   .reply(200, ["Xqcow", "DestiNy"])
//   .get(encodeURI("/Xqcow chatlog/January 2020/2020-01-05.txt"))
//   .reply(200, xqcData)
//   .get(encodeURI("/Destiny chatlog/January 2020/2020-01-05.txt"))
//   .reply(200, destinyData)
//   .get(encodeURI("/Destiny chatlog/January 2020/2020-01-07.txt"))
//   .reply(404)
//   .persist();

// const mockDir = "mock-data";
// test.beforeEach(async t => {
//   await fs.remove(mockDir);
//   const mockFileservice = await FileService.build({
//     fileWriter: {
//       directory: `${mockDir}/orl`,
//       writerEnabled: true,
//     },
//   });

//   const mockCacheSerivice = await CacheService.build({
//     cache: {
//       downloadCachePath: `${mockDir}/download-cache.txt`,
//       indexCachePath: `${mockDir}/index-cache.txt`,
//     },
//   });
//   const mockDownloadService = await DownloadService.build(
//     {
//       downloadService: {
//         monthsPath: `${mockDir}/months/`,
//         channelsUrl: "https://overrustlelogs.net/api/v1/channels.json",
//       },
//     },
//     mockFileservice,
//     mockCacheSerivice,
//   );

//   t.context.fileService = mockFileservice;
//   t.context.downloadService = mockDownloadService;
//   t.context.cacheService = mockCacheSerivice;
// });

// test.afterEach.always("cleanup mock-data dir", async () => {
//   await fs.remove(mockDir);
// });

// test("gets channels and normalizes them", async t => {
//   const channels = await t.context.downloadService.fetchChannels();
//   t.deepEqual(channels, ["Xqcow", "Destiny"]);
// });

// test("downloads single targeted log", async t => {
//   await t.context.downloadService.downloadLog("Destiny", dayjs("2020-01-05"));
//   const p = `${mockDir}/orl/Destiny::2020-01-05.txt`;
//   const fileExists = await fs.pathExists(p);
//   t.true(fileExists);
//   const contents = await fs.readFile(p, "utf8");
//   t.is(contents, destinyData);
// });
// test("404 log gets written to download cache", async t => {
//   await t.context.downloadService.downloadLog("Destiny", dayjs("2020-01-07"));
//   const p = `${mockDir}/orl/Destiny::2020-01-07.txt`;
//   const fileExists = await fs.pathExists(p);
//   t.false(fileExists);
//   t.true(t.context.cacheService.downloadCached("Destiny::2020-01-07.txt"));
// });
