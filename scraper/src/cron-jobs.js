const { CronJob } = require("cron");

const syncChannelsCron = client =>
  new CronJob(
    "* */12 * * *",
    async () => {
      await client.syncChannels();
      console.log("Synced");
    },
    null,
    true,
    "UTC",
  );

module.exports = {
  syncChannelsCron,
};
