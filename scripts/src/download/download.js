/* eslint-disable no-restricted-syntax */
const _ = require("lodash");
const pMap = require("p-map");
const {
  dayjs,
  capitalise,
  cachedFetch,
  cachedCompressedDownload,
  fs,
} = require("../util");

require("colors");

const baseUrl = "https://overrustlelogs.net";

const buildAppendMissing = async config => {
  await fs.ensureFile(config.paths.missingCache);
  const missingStream = fs.createWriteStream(config.paths.missingCache, {
    encoding: "utf8",
    flags: "a",
  });
  return line => missingStream.write(`${line}\n`);
};
const toComboStr = (day, channel) => `${channel}::${day.format("YYYY-MM-DD")}`;
const buildDownloadLog = (config, missing, appendMissing) => async (
  channel,
  day,
) => {
  const str = `${channel}::${day.format("YYYY-MM-DD")}`;
  if (missing.has(str)) return;
  if (await fs.pathExists(`${config.paths.orl}/${str}.txt.gz`)) return;

  const months = await cachedFetch(
    `${baseUrl}/api/v1/${channel}/months.json`,
    `${config.paths.months}/${channel}.json`,
    true,
  );
  if (!months) {
    console.log("months don't exist");
    return;
  }
  if (dayjs(_.last(months)).isAfter(day)) return;
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
const main = async (config, daysback) => {
  const channelsContent = await fs.readFile(config.paths.channels, "utf8");
  const channels = channelsContent.trim().split("\n");
  const today = dayjs().utc();

  const dayList = _.range(1, daysback + 1).map(n => today.subtract(n, "d"));
  const missingContents = await fs.inputFile(config.paths.missingCache, "utf8");
  const missing = new Set(missingContents.trim().split("\n"));
  console.log(`${missing.size} in cache`);
  const appendMissing = await buildAppendMissing(config);
  const downloadLog = buildDownloadLog(config, missing, appendMissing);
  const combos = dayList.flatMap(day =>
    channels.map(channel => [day, channel]),
  );
  const toDownload = combos.filter(
    ([day, channel]) => !missing.has(toComboStr(day, channel)),
  );
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
