const { splitEvery } = require("ramda");
const { Worker } = require("worker_threads");
const config = require("../config");
const { fs, getFileByLine } = require("../../util");
// const worker = require('./worker')

const indexToElastic = async threads => {
  const allPathsNames = await fs.readdirSafe(config.paths.orl);
  const allPaths = allPathsNames.map(file => `${config.paths.orl}/${file}`);

  const ingestedPaths = await getFileByLine(config.paths.indexCache, {
    set: true,
  });

  const pathsToIngest = allPaths.filter(file => !ingestedPaths.has(file));
  const chunkLength = Math.ceil(pathsToIngest.length / threads);
  if (chunkLength < 1) return;
  const chunkedPaths = splitEvery(chunkLength, pathsToIngest);

  const workers = chunkedPaths.map(pathChunk => {
    const worker = new Worker("./src/index_service/worker.js", {
      workerData: pathChunk,
    });

    return worker;
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received, starting graceful shutdown.");
    workers.forEach(worker => worker.postMessage("shouldExit"));
  });

  // worker.indexToElastic(pathsToIngest)
  console.info({
    totalDaysIngested: ingestedPaths.size,
    totalDaysOfLogs: allPaths.length,
    totalDaysToIngest: pathsToIngest.length,
  });
};

if (require.main === module) {
  indexToElastic();
}

module.exports = {
  indexToElastic,
};
