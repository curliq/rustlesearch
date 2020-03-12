const fs = require("fs-extra");

class CacheService {
  constructor(config) {
    this.config = config.cache;
    this.writerMap = new Map({
      download: fs.createWriteStream(this.config.downloadCachePath, {
        encoding: "utf8",
        flags: "a",
      }),
    });
  }

  writeDownload(filename) {
    this.writerMap.get("download").write(`${filename}\n`);
  }
}

module.exports = CacheWriter;
