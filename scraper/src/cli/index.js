const program = require("commander");
const config = require("../config");
const IntegrationService = require("../services/integration-service");
const { dayjs, getDayRangeList, getChannels, sleep } = require("../util");

program.version("0.1.0", "-v, --version", "Output the current version");

const myParseInt = v => parseInt(v, 10);

const downloadAndIndex = async cmd => {
  try {
    const integrationService = IntegrationService(config);
    const yesterday = dayjs.utc().subtract(1, "d");
    const startDay = yesterday.subtract(cmd.days, "d");
    const days = getDayRangeList(startDay, yesterday);
    const channels = await getChannels();
    await integrationService.indexManyLogs(channels, days);
  } catch (e) {
    await sleep(2000);
    await downloadAndIndex(cmd);
    /* handle error */
  }
};
program
  .command("index")
  .option("-d, --days <number>", "Days back to download logs", myParseInt, 1)
  .description("Downloads OverRustleLogs chat logs")
  .action(downloadAndIndex);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
