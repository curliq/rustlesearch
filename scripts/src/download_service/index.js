const request = require("superagent");
const { DateTime } = require("luxon");
const Promise = require("bluebird");
const { inc, map, pipe, range, unnest, reject, isNil, last } = require("ramda");
const { promisify } = require("util");
const stream = require("stream");
const zlib = require("zlib");
const { getFileByLine, fs, sleep } = require("../../util");
const config = require("../config");

const finished = promisify(stream.finished);
// "Constants"
const baseUrl = "https://overrustlelogs.net";
const today = DateTime.utc();
// smol Functions
const fullDateFormat = date => date.toFormat("MMMM yyyy/yyyy-MM-dd");
const fileDateFormat = date => date.toFormat("yyyy-MM-dd");
const dateFromMonths = months => DateTime.fromFormat(last(months), "LLLL yyyy");

const toPathAndUrl = ({ channel: { channel, startDate }, date }) => {
  if (startDate < date) {
    return [
      `${config.paths.orl}/${channel}::${fileDateFormat(date)}.txt`,
      `${baseUrl}/${channel} chatlog/${fullDateFormat(date)}.txt`,
    ];
  }

  return null;
};

// swol Functions
const getUrlList = (channels, daysBack) =>
  pipe(
    inc,
    range(1),
    map(day => today.minus({ days: day })),
    map(date => channels.map(channel => toPathAndUrl({ channel, date }))),
    unnest,
    reject(isNil),
  )(daysBack);

const downloadFile = throttle => async ([path, uri]) => {
  await sleep(throttle);
  try {
    const { text: res } = await request.get(uri);
    const s = new stream.Readable();
    s.push(res);
    s.push(null);
    const writeStream = fs.createWriteStream(path);
    const encoder = zlib.createDeflate();

    await finished(s.pipe(encoder).pipe(writeStream));
    console.info(`Wrote ${path} to disk.`);
  } catch (e) {
    // console.log(e)
    await fs.outputFile(config.paths.downloadCache, `${path}\n`, { flag: "a" });
    console.info(`${path} 404, wrote file to download cache.`);
  }
};

const cachedGet = async (path, uri) => {
  // eslint-disable-next-line no-sync
  const pathExists = await fs.pathExists(path);

  if (!pathExists) {
    try {
      const { text: res } = await request.get(uri);
      await fs.outputFile(path, res);
      console.debug(`Wrote ${path} to disk.`);
    } catch (error) {
      console.warn(error);

      return null;
    }
  }

  return fs.inputFile(path, "utf8");
};

const getChannelStartDate = async channel => {
  const months = await cachedGet(
    `${config.paths.months}/${channel}.json`,
    `${baseUrl}/api/v1/${channel}/months.json`,
  );

  return { channel, startDate: dateFromMonths(JSON.parse(months)) };
};

const download = async (daysBack, throttle) => {
  if (!daysBack || !throttle) {
    console.log("options missing");

    return;
  }

  const { body: channels } = await request.get(
    "https://overrustlelogs.net/api/v1/channels.json",
  );

  const processedChannels = await Promise.map(channels, getChannelStartDate, {
    concurrency: 20,
  });

  const totalUrls = getUrlList(processedChannels, daysBack);

  const discardCache = await getFileByLine(config.paths.discardCache, {
    set: true,
  });

  const downloadCache = await getFileByLine(config.paths.downloadCache, {
    set: true,
  });

  const downloadedLogFiles = await fs.readdirSafe(config.paths.orl);

  const downloadedLogs = new Set(
    downloadedLogFiles.map(file => `${config.paths.orl}/${file}`),
  );

  const urlsToDownload = totalUrls.filter(
    url =>
      !(
        downloadedLogs.has(url[0]) ||
        downloadCache.has(url[0]) ||
        discardCache.has(url[0])
      ),
  );

  console.info(`
  Beginning download.
  Total days to download: ${totalUrls.length}
  Days already downloaded: ${downloadedLogs.size || 0}
  Days to download right now: ${urlsToDownload.length}`);

  await Promise.map(urlsToDownload, downloadFile(throttle), {
    concurrency: 10,
  });
};

module.exports = {
  download,
};
