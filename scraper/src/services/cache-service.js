const fs = require("fs-extra");

class CacheService {
  constructor({ cache }) {
    this.config = cache;
    this.writerMap = new Map({
      download: fs.createWriteStream(this.config.downloadCachePath, {
        encoding: "utf8",
        flags: "a",
      }),
      index: fs.createWriteStream(this.config.indexCachePath, {
        encoding: "utf8",
        flags: "a",
      }),
    });
  }

  async setup() {
    await fs.ensureDir(this.config.cacheDir);
    await fs.ensureFile(this.config.downloadCachePath);
    await fs.ensureFile(this.config.indexCachePath);
  }

  static async build(...args) {
    const instance = new CacheService(...args);
    await instance.setup();
    return instance;
  }

  writeDownload(filename) {
    this.writerMap.get("download").write(`${filename}\n`);
  }

  writeIndex(filename) {
    this.writerMap.get("index").write(`${filename}\n`);
  }

  async getDownloadCache() {
    const body = await fs.readFile(this.config.downloadCachePath);
    return new Set(body.split("\n"));
  }

  async getIndexCache() {
    const body = await fs.readFile(this.config.indexCachePath);
    return new Set(body.split("\n"));
  }
}

module.exports = CacheService;
