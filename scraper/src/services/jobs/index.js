const cron = require("node-cron");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);

const { replaceDay } = require("../scripts");

module.exports = ({ config, twitchScraper, elasticWriter }) => {
  cron.schedule("* */12 * * *", twitchScraper.syncChannels, { timezone: "Etc/UTC" });
  cron.schedule("0 0 * *  *", () => {
    const yesterday = dayjs()
      .utc()
      .subtract(1, "d")
      .format("YYYY-MM-DD");
    replaceDay(elasticWriter, yesterday);
  });
};
