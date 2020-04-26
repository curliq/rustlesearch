const _ = require("lodash");
const { spawn, Worker, Pool } = require("threads");
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
  // const chunkLength = Math.ceil(pathsToIngest.length / threads);
  // if (chunkLength < 1) return;
  const chunkedPaths = _.chunk(pathsToIngest, 50);
  if (chunkedPaths.length < 1) return;

  const pool = Pool(() => spawn(new Worker("./worker.js")), threads);
  chunkedPaths.forEach(pathsChunk =>
    pool.queue(async worker => worker.index(pathsChunk)),
  );
  console.info({
    totalDaysIngested: indexed.size,
    totalDaysOfLogs: allPaths.length,
    totalDaysToIngest: pathsToIngest.length,
  });
  await pool.completed();
  await pool.terminate();
};
