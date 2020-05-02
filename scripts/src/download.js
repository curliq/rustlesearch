/* eslint-disable no-restricted-syntax */
const _ = require("lodash");
const pMap = require("p-map");
const fg = require("fast-glob");
const { parse } = require("path");
const {
  dayjs,
  capitalise,
  cachedFetch,
  cachedCompressedDownload,
  fs,
} = require("./util");
const config = require("./config");

require("colors");

const buildOrlFs = require("./orl-fs");

const orlFs = buildOrlFs({
  orl: config.paths.orl,
  channelsPath: config.paths.channels,
});

const baseUrl = "https://overrustlelogs.net";

const buildAppendMissing = async () => {
  await fs.ensureFile(config.paths.missingCache);
  const missingStream = fs.createWriteStream(config.paths.missingCache, {
    encoding: "utf8",
    flags: "a",
  });
  return line => missingStream.write(`${line}\n`);
};
const buildDownloadLog = (months, missing, appendMissing) => async (
  channel,
  day,
) => {
  const str = `${channel}::${day.format("YYYY-MM-DD")}`;
  if (missing.has(str)) return;

  if (!months[channel]) {
    console.log("months don't exist");
    return;
  }
  if (dayjs(_.last(months[channel])).isAfter(day)) return;
  if (await fs.pathExists(`${config.paths.orl}/${str}.txt.gz`)) return;
  const { success, cached } = await cachedCompressedDownload(
    `${baseUrl}/${channel} chatlog/${day.format("MMMM YYYY/YYYY-MM-DD")}.txt`,
    `${config.paths.orl}/${str}.txt.gz`,
  );
  if (!success) {
    console.log(str.red);
    appendMissing(str);
    return;
  }
  if (!cached) console.log(str.green);
};
const getMonths = async channels => {
  const months = {};
  for (const channel of channels) {
    // eslint-disable-next-line no-await-in-loop
    months[channel] = await cachedFetch(
      `${baseUrl}/api/v1/${channel}/months.json`,
      `${config.paths.months}/${channel}.json`,
      true,
    );
  }
  return months;
};
const main = async daysback => {
  const filecombos = await orlFs
    .listCompressedLogs()
    .then(logs => new Set(logs.map(x => x.combo)));
  const channels = [...(await orlFs.fetchChannels())];
  const today = dayjs().utc();

  const dayList = _.range(1, daysback + 1).map(n => today.subtract(n, "d"));
  const missingContents = await fs.inputFile(config.paths.missingCache, "utf8");
  const missing = new Set(missingContents.trim().split("\n"));
  console.log(`${missing.size} in cache`);
  const appendMissing = await buildAppendMissing();
  const months = await getMonths(channels);
  const downloadLog = buildDownloadLog(months, missing, appendMissing);
  const combos = dayList.flatMap(day =>
    channels.map(channel => [day, channel]),
  );
  const toDownload = combos.filter(([day, channel]) => {
    const comboStr = orlFs.buildComboString({
      channel,
      date: day.format("YYYY-MM-DD"),
    });
    return !missing.has(comboStr) && !filecombos.has(comboStr);
  });
  console.log(`${toDownload.length} to download`);
  await pMap(
    toDownload,
    ([day, channel]) => downloadLog(capitalise(channel), day),
    {
      concurrency: 10,
    },
  );
  console.log(`Finished ${daysback} days back`);
};

module.exports = main;
