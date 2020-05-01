/* eslint-disable no-sync */
const Promise = require("bluebird");
const superagent = require("superagent");
const fs = require("fs-extra");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
const zlib = require("zlib");
const { promisify } = require("util");
const { parse, sep, join } = require("path");
const _ = require("lodash");

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);

const co = fn => Promise.coroutine(fn);

const capitalise = string =>
  string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

fs.inputFile = async (path, ...args) => {
  try {
    const contents = await fs.readFile(path, ...args);

    return contents;
  } catch (e) {
    await fs.ensureFile(path);

    return fs.readFile(path, ...args);
  }
};

fs.readdirSafe = async (path, ...args) => {
  try {
    const contents = await fs.readdir(path, ...args);

    return contents;
  } catch (e) {
    await fs.ensureDir(path);

    return fs.readdir(path, ...args);
  }
};

const getFileByLine = async (filePath, { set } = { set: false }) => {
  const file = await fs.inputFile(filePath, "utf8");
  const arr = file.trim().split("\n");
  if (set) return new Set(arr);

  return arr;
};

const cachedFetch = async (url, path, json = false) => {
  if (await fs.pathExists(path)) {
    try {
      const content = await fs.readFile(path, "utf8");
      if (json) {
        return JSON.parse(content);
      }
      return content;
    } catch (e) {
      return undefined;
    }
  }
  try {
    const { text } = await superagent.get(url);
    await fs.outputFile(path, text);
    if (json) {
      return JSON.parse(text);
    }
    return text;
  } catch (e) {
    return undefined;
  }
};

const cachedCompressedFetch = async (url, path, json = false) => {
  if (await fs.pathExists(path)) {
    try {
      const raw = await fs.readFile(path);
      const content = await gunzip(raw);

      if (json) {
        return JSON.parse(content);
      }
      return content;
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }
  try {
    const { text } = await superagent.get(url);
    const compressed = await gzip(text);
    await fs.outputFile(path, compressed);
    if (json) {
      return JSON.parse(text);
    }
    return text;
  } catch (e) {
    return undefined;
  }
};

const cachedCompressedDownload = async (url, path) => {
  if (await fs.pathExists(path)) {
    return { success: true, cached: true };
  }
  try {
    const { text } = await superagent.get(url);
    const compressed = await gzip(text);
    await fs.outputFile(path, compressed);
    return { success: true, cached: false };
  } catch (e) {
    return { success: false, cached: false };
  }
};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const getChannels = cfg =>
  fs
    .readFile(cfg.paths.channels, "utf8")
    .then(channels => channels.trim().split("\n"));

const pathToCombo = p => {
  const channel = _.last(parse(p).dir.split(sep));
  const date = parse(p)
    .base.replace(".gz", "")
    .replace(".txt", "");
  return { channel, date: dayjs.utc(date) };
};
const comboToPath = ({ channel, date }, gz = false) => {
  const ext = gz ? ".txt.gz" : ".txt";
  return join(channel, `${date.format("YYYY-MM-DD")}${ext}`);
};

module.exports = {
  capitalise,
  co,
  sleep,
  fs,
  getFileByLine,
  dayjs,
  cachedFetch,
  cachedCompressedFetch,
  cachedCompressedDownload,
  getChannels,
  pathToCombo,
  comboToPath,
};
