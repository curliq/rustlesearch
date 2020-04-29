const { CronJob } = require("cron");
const { dayjs } = require("./util");

module.exports = (state) => {
  const syncChannels = new CronJob(
    "*/1 * * * *",
    () => {
      console.log(`[${dayjs.utc().toString()}] Syncing twitch channels`);
      state.twitchScraper.syncChannels();
    },
    null,
    true,
    "Etc/UTC",
  );

  return {
    syncChannels,
  };
};
