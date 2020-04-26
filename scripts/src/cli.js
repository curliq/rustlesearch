const program = require("commander");
const download = require("./download/download");
const indexToElastic = require("./index-to-elastic/index-to-elastic");
const initElastic = require("./init-elastic");
const countLines = require("./count-lines");
// const rimraf = require("./rimraf");
// const status = require("./status");
const config = require("./config");
// const cleanIndex = require("./index_service/clean-index.js");

program.version("0.1.0", "-v, --version", "Output the current version");
const myParseInt = v => parseInt(v, 10);

program
  .command("download")
  .option(
    "-d, --days <number>",
    "Days back to download logs",
    myParseInt,
    config.download.days,
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
    config.index.threads,
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
  .action(() => initElastic());

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
  .command("delete-logs <startDate> <endDate> [channels...]")
  .description("Delete logs for channels and date ranges")
  .action(cmd => {
    return deleteBack(cmd);
  });

program
  .command("count-lines <channel> <day>")
  .description("Count lines in a compressed log")
  .action(async (channel, day) => {
    await countLines(channel, day);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
