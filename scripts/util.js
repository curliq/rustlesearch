/* eslint-disable no-sync */
const Promise = require("bluebird");
const fs = require("fs-extra");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);

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

fs.inputFileSync = (path, ...args) => {
  try {
    const contents = fs.readFileSync(path, ...args);

    return contents;
  } catch (e) {
    fs.ensureFileSync(path);

    return fs.readFileSync(path, ...args);
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

fs.readdirSafeSync = async (path, ...args) => {
  try {
    const contents = fs.readdirSync(path, ...args);

    return contents;
  } catch (e) {
    fs.ensureDirSync(path);

    return fs.readdirSync(path, ...args);
  }
};

const getFileByLine = async (filePath, { set } = { set: false }) => {
  const file = await fs.inputFile(filePath, "utf8");
  const arr = file.trim().split("\n");
  if (set) return new Set(arr);

  return arr;
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  capitalise,
  co,
  sleep,
  fs,
  getFileByLine,
  dayjs,
};
