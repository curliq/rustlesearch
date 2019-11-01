const program = require("commander");
const { download } = require("./download_service");
const { indexToElastic } = require("./index_service");
const { initElastic } = require("./init-elastic");
const rimraf = require("./rimraf");
const status = require("./status");
const config = require("./config");
const cleanIndex = require("./index_service/clean-index.js");

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
    download(cmd.days, cmd.throttle);
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
    await initElastic();
    indexToElastic(cmd.threads);
  });

program
  .command("status")
  .description("Show status of various parts of Rustlesearch")
  .action(() => status());

program
  .command("init")
  .description("Initialize index settings for Elasticsearch")
  .action(() => initElastic());

program
  .command("rimraf")
  .description("Delete stuff monkaW")
  .option("--download-cache", "Delete download_cache.txt file")
  .option("--index-cache", "Delete index_cache.txt file")
  .option("--discard-cache", "Delete discard_cache.txt file")
  .option("--chat-logs", "Delete all ORL chat logs")
  .option("--all", "Delete all possible files (reset)")
  .action(cmd => {
    if (!process.argv.slice(3).length) {
      return cmd.outputHelp();
    }

    return rimraf(cmd);
  });

program
  .command("clean-index")
  .description("Clean index cache by checking Elasticsearch")
  .action(() => {
    return cleanIndex();
  });

program
  .command("config")
  .description("Echo computed configuration")
  .action(() => {
    console.log(JSON.stringify(config, null, 2));
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
