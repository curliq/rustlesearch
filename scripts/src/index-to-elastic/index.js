const _ = require("lodash");
const { spawn, Worker, Pool } = require("threads");
const config = require("../config");
const { fs } = require("../util");
const buildOrlFs = require("../orl-fs");
// const worker = require('./worker')

module.exports = async threads => {
  console.log(`Threads: ${threads}`);
  const orlFs = buildOrlFs({
    orl: config.paths.orl,
    channelsPath: config.paths.channels,
  });
  const allLogs = await orlFs.listCompressedLogs();
  const indexed = await fs
    .inputFile(config.paths.indexCache, "utf8")
    .then(f => new Set(f.trim().split("\n")));

  const logsToIndex = allLogs.filter(log => !indexed.has(log.combo));
  const chunkLength = Math.ceil(logsToIndex.length / threads);
  if (chunkLength < 1) return;
  const chunkedPaths = _.chunk(logsToIndex, Math.min(50, chunkLength));
  if (chunkedPaths.length < 1) return;

  const pool = Pool(() => spawn(new Worker("./worker.js")), threads);
  chunkedPaths.forEach(pathsChunk =>
    pool.queue(async worker => worker.index(pathsChunk)),
  );
  console.info({
    totalDaysIngested: indexed.size,
    totalDaysOfLogs: allLogs.length,
    totalDaysToIngest: logsToIndex.length,
  });
  await pool.completed();
  await pool.terminate();
};
