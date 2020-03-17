const nanomemoize = require("nano-memoize");
const fs = require("fs-extra");
const { join } = require("path");
const { promisify } = require("util");
const R = require("ramda");
const zlib = require("zlib");
const { normalizeMessage, capitalise } = require("../util");

const deflate = promisify(zlib.deflate);
const inflate = promisify(zlib.inflate);

module.exports = cfg => {
  const safeRead = async (path, ...args) => {
    try {
      const text = await fs.readFile(path, ...args);
      return text;
    } catch (e) {
      await fs.ensureFile(path);
      return safeRead(path, ...args);
    }
  };
  const safeWrite = fs.outputFile;
  const safeWriteStream = async (path, ...args) => {
    await fs.ensureFile(path);
    return fs.createWriteStream(path, ...args);
  };
  const memoWriteAppendStream = nanomemoize(path =>
    safeWriteStream(path, { flags: "a", encoding: "utf8" }),
  );
  const getLogFilename = ({ channel, day }) =>
    `${capitalise(channel)}::${day.format("YYYY-MM-DD")}.txt`;
  const jsonExt = path => `${path}.json`;
  const deflateExt = path => `${path}.zz`;
  const join2 = R.curryN(2, join);
  const join3 = R.curryN(3, join);
  const utf8Read = v => safeRead(v, "utf8");
  const messageToLogString = msg => {
    const { normMsg } = normalizeMessage(msg, "YYYY-MM-DD HH:mm:ss");
    return `[${normMsg.ts} UTC] ${normMsg.username}: ${normMsg.text}`;
  };

  const compressedRead = R.pipe(fs.readFile, R.andThen(inflate), R.andThen(R.toString));

  const compressedLogPath = R.pipe(getLogFilename, deflateExt, join2(cfg.fileService.orlDir));
  const compressedLogExists = R.pipe(compressedLogPath, fs.pathExists);
  const compressedLogRead = R.pipe(compressedLogPath, compressedRead);
  const compressedLogWrite = async (logInfo, data) =>
    safeWrite(compressedLogPath(logInfo), await deflate(data));

  const uncompressedLogPath = R.pipe(getLogFilename, join2(cfg.fileService.orlDir));
  const uncompressedLogExists = R.pipe(uncompressedLogPath, fs.pathExists);
  const uncompressedLogRead = R.pipe(compressedLogPath, utf8Read);
  const uncompressedLogWrite = (logInfo, data) => safeWrite(compressedLogPath(logInfo), data);

  const uncompressedLogWriteStream = ({ channel, day }) => {
    const path = uncompressedLogPath({ channel: capitalise(channel), day });
    return memoWriteAppendStream(path);
  };

  const messageWrite = async msg => {
    const stream = await uncompressedLogWriteStream({ channel: msg.channel, day: msg.ts });
    return new Promise(resolve => {
      stream.write(`${messageToLogString(msg)}\n`, () => {
        resolve();
      });
    });
  };
  const monthsPath = R.pipe(jsonExt, join3(cfg.fileService.dir, "months"));
  const monthsExists = R.pipe(monthsPath, fs.pathExists);
  const monthsRead = R.pipe(monthsPath, utf8Read);
  const monthsWrite = async (channel, data) => fs.outputFile(monthsPath(channel), data);

  const downloadCachePath = `${cfg.fileService.dir}/download-cache.txt`;
  const downloadCacheRead = () => utf8Read(downloadCachePath);

  const downloadCacheWrite = async logInfo => {
    const stream = await memoWriteAppendStream(downloadCachePath);
    return new Promise(resolve => {
      stream.write(`${getLogFilename(logInfo)}\n`, () => {
        resolve();
      });
    });
  };
  const indexCachePath = `${cfg.fileService.dir}/index-cache.txt`;
  const indexCacheRead = () => utf8Read(indexCachePath);

  const indexCacheWrite = async logInfo => {
    const stream = await memoWriteAppendStream(indexCachePath);
    return new Promise(resolve => {
      stream.write(`${getLogFilename(logInfo)}\n`, () => {
        resolve();
      });
    });
  };
  const anywhereLogExists = async v =>
    (await Promise.all([compressedLogExists(v), uncompressedLogExists(v)])).includes(true);

  return {
    getLogFilename,
    jsonExt,
    deflateExt,
    utf8Read,
    compressedRead,
    messageToLogString,
    compressedLogPath,
    compressedLogExists,
    compressedLogRead,
    compressedLogWrite,
    uncompressedLogPath,
    uncompressedLogExists,
    uncompressedLogRead,
    uncompressedLogWrite,
    uncompressedLogWriteStream,
    messageWrite,
    monthsPath,
    monthsExists,
    monthsRead,
    monthsWrite,
    downloadCacheRead,
    downloadCacheWrite,
    indexCacheRead,
    indexCacheWrite,
    anywhereLogExists,
  };
};
