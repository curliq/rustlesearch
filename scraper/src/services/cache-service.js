const fs = require("fs-extra");

class CacheService {
  constructor({ cache }) {
    this.config = cache;
    this.downloadCache = new Set();
    this.indexCache = new Set();
  }

  async setup() {
    await fs.ensureFile(this.config.downloadCachePath);
    await fs.ensureFile(this.config.indexCachePath);

    this.streamMap = new Map([
      [
        "download",
        fs.createWriteStream(this.config.downloadCachePath, {
          encoding: "utf8",
          flags: "a",
        }),
      ],
      [
        "index",
        fs.createWriteStream(this.config.indexCachePath, {
          encoding: "utf8",
          flags: "a",
        }),
      ],
    ]);
    this.loadDownloadCache();
    this.loadIndexCache();
  }

  static async build(...args) {
    const instance = new CacheService(...args);
    await instance.setup();
    return instance;
  }

  writeDownload(filename) {
    this.streamMap.get("download").write(`${filename}\n`);
    this.downloadCache.add(filename);
  }

  writeIndex(filename) {
    this.streamMap.get("index").write(`${filename}\n`);
  }

  async loadDownloadCache() {
    const body = await fs.readFile(this.config.downloadCachePath, "utf8");
    console.log(body);
    this.downloadCache = new Set([...this.downloadCache, ...body.split("\n")]);
  }

  downloadCached(filename) {
    return this.downloadCache.has(filename);
  }

  async loadIndexCache() {
    const body = await fs.readFile(this.config.indexCachePath, "utf8");
    console.log(body);
    this.indexCache = new Set([...this.indexCache, ...body.split("\n")]);
  }

  getIndexCache() {
    return this.indexCache;
  }
}

module.exports = CacheService;
