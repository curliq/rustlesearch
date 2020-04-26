const _ = require("lodash");
const { spawn, Worker, Thread } = require("threads");
const fg = require("fast-glob");
const { parse } = require("path");
const config = require("../config");
const { fs } = require("../util");
// const worker = require('./worker')

module.exports = async threads => {
  await fs.ensureDir(config.paths.orl);
  const allPaths = await fg(`${config.paths.orl}/*.gz`, {
    onlyFiles: true,
  });
  const indexedContents = await fs.inputFile(config.paths.indexCache, "utf8");
  const indexed = new Set(indexedContents.trim().split("\n"));

  const pathsToIngest = allPaths.filter(
    file => !indexed.has(parse(file).base.replace(".txt.gz", "")),
  );
  const chunkLength = Math.ceil(pathsToIngest.length / threads);
  if (chunkLength < 1) return;
  const chunkedPaths = _.chunk(pathsToIngest, chunkLength);

  chunkedPaths.forEach(async pathsChunk => {
    const worker = await spawn(new Worker("./worker"));
    await worker.index(pathsChunk);
    console.log(`Finished ${pathsChunk.length} logs`);
    await Thread.terminate(worker);
  });
  console.info({
    totalDaysIngested: indexed.size,
    totalDaysOfLogs: allPaths.length,
    totalDaysToIngest: pathsToIngest.length,
  });
};
