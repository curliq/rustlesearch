const program = require("commander");
const download = require("./download");
const indexToElastic = require("./index-to-elastic");
const compressLiveLogs = require("./compress-live-logs");
const initElastic = require("./init-elastic");
const countLines = require("./count-lines");
const deleteScript = require("./delete");
// const rimraf = require("./rimraf");
// const status = require("./status");
const config = require("./config");
// const cleanIndex = require("./index_service/clean-index.js");

program.version("0.1.0", "-v, --version", "Output the current version");
const myParseInt = v => parseInt(v, 10);

program
  .command("download")
  .requiredOption(
    "-d, --days <number>",
    "Days back to download logs",
    myParseInt,
  )
  .option(
    "-t, --throttle <number>",
    "Throttle delay between requests (ms)",
    myParseInt,
    config.download.throttle,
  )
  .description("Downloads OverRustleLogs chat logs")
  .action(cmd => {
    download(config, cmd.days);
  });

program
  .command("index")
  .option(
    "-t, --threads <number>",
    "# of parallel worker threads to use",
    myParseInt,
    config.elastic.threads,
  )
  .description("Indexes chat logs into Elasticsearch")
  .action(async cmd => {
    await initElastic(config);
    indexToElastic(cmd.threads);
  });

// program
//   .command("status")
//   .description("Show status of various parts of Rustlesearch")
//   .action(() => status());

program
  .command("init")
  .description("Initialize index settings for Elasticsearch")
  .action(() => initElastic(config));

// program
//   .command("rimraf")
//   .description("Delete stuff monkaW")
//   .option("--download-cache", "Delete download_cache.txt file")
//   .option("--index-cache", "Delete index_cache.txt file")
//   .option("--discard-cache", "Delete discard_cache.txt file")
//   .option("--chat-logs", "Delete all ORL chat logs")
//   .option("--all", "Delete all possible files (reset)")
//   .action(cmd => {
//     if (!process.argv.slice(3).length) {
//       return cmd.outputHelp();
//     }

//     return rimraf(cmd);
//   });

// program
//   .command("clean-index")
//   .description("Clean index cache by checking Elasticsearch")
//   .action(() => {
//     return cleanIndex();
//   });

program
  .command("config")
  .description("Echo computed configuration")
  .action(() => {
    console.log(JSON.stringify(config, null, 2));
  });

program
  .command("delete-logs [channels...]")
  .requiredOption(
    "-s, --start-date <string>",
    "Start of date range to delete, e.g 2019-02-01",
  )
  .requiredOption(
    "-e, --end-date <string>",
    "End of date range to delete, e.g 2019-03-01",
  )
  .option("--remove-logs", "Remove log files")
  .option("--no-cache", "Do not remove deleted items from index-cache")
  .description("Delete logs for channels and date ranges")
  .action(async (channels, cmd) => {
    await deleteScript(
      config,
      cmd.startDate,
      cmd.endDate,
      channels,
      cmd.removeLogs,
    );
  });

program
  .command("count-lines <channel> <day>")
  .description("Count lines in a compressed log")
  .action(async (channel, day) => {
    await countLines(config, channel, day);
  });
program
  .command("compress-live-logs")
  .description("Compresses all live logs to .gz files")
  .action(async () => {
    await compressLiveLogs(config);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
