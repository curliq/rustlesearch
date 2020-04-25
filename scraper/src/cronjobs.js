const { CronJob } = require("cron");

module.exports = (state) => {
  const syncChannels = new CronJob(
    "*/1 * * * *",
    () => {
      console.log("[Cron] Syncing twitch channels");
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
