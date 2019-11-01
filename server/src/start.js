/* eslint-disable global-require */
const cluster = require("cluster");
const { times } = require("ramda");
const config = require("./config");
const logger = require("./lib/logger");

const launch = () => cluster.fork();

const initMaster = () => {
  const workerCount = config.isProd ? config.workers : 1;

  times(launch, workerCount);

  logger.info(`Started ${workerCount} workers.`);
  logger.info(`App listening at http://localhost:${config.app.port}`);
};

const initWorker = () => {
  const app = require("./server");

  app.listen(config.app.port);
};

cluster.on("exit", worker => {
  logger.error(`Worker ${worker.id} died...`);
  if (config.isProd) cluster.fork();
  throw new Error("Application failed to run");
});

cluster.on("error", err => {
  logger.error({ error: err.message });
});

if (cluster.isMaster) {
  initMaster();
} else {
  initWorker();
}
