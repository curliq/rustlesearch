const nanomemoize = require("nano-memoize");
const FileService = require("./file-service");
const DownloadService = require("./download-service");
const { cmpDayWithMonths } = require("../util");

module.exports = cfg => {
  const fileService = FileService(cfg);
  const downloadService = DownloadService();

  const getDownloadCacheSet = nanomemoize(
    async () => {
      const text = await fileService.downloadCacheRead();
      return new Set(text.split("\n"));
    },
    { maxAge: 1000 * 60 * 30 },
  );

  const getIndexCacheSet = nanomemoize(
    async () => {
      const text = await fileService.indexCacheRead();
      return new Set(text.split("\n"));
    },
    { maxAge: 1000 * 60 * 30 },
  );
  const fetchMonthCached = nanomemoize(async channel => {
    if (await fileService.monthsExists(channel)) {
      return fileService.monthsRead(channel);
    }
    const body = await downloadService.downloadMonths(channel);
    await fileService.monthsWrite(channel, body);
    return body;
  });

  const fetchLogCached = async logInfo => {
    const downloadCacheSet = await getDownloadCacheSet();
    if (downloadCacheSet.has(fileService.getLogFilename(logInfo))) {
      return null;
    }
    const months = await fetchMonthCached(logInfo.channel);
    if (!cmpDayWithMonths(months, logInfo.day)) {
      return null;
    }
    const exists = await fileService.compressedLogExists(logInfo);
    if (exists) {
      return fileService.compressedLogRead(logInfo);
    }
    try {
      const text = await downloadService.downloadLog(logInfo);
      await fileService.compressedLogWrite(logInfo, text);
      return text;
    } catch (e) {
      await fileService.downloadCacheWrite(logInfo);
      return null;
    }
  };

  return {
    getIndexCacheSet,
    getDownloadCacheSet,
    fetchMonthCached,
    fetchLogCached,
  };
};

// class CacheService {
//   constructor(config) {
//     this.downloadCachePath = config.cache.downloadCachePath;
//     this.indexCachePath = config.cache.indexCachePath;

//     this.config = config;
//     this.downloadCache = new Set();
//     this.indexCache = new Set();
//   }

//   async setup() {
//     await fs.ensureFile(this.downloadCachePath);
//     await fs.ensureFile(this.indexCachePath);

//     this.streamMap = new Map([
//       [
//         "download",
//         fs.createWriteStream(this.downloadCachePath, {
//           encoding: "utf8",
//           flags: "a",
//         }),
//       ],
//       [
//         "index",
//         fs.createWriteStream(this.indexCachePath, {
//           encoding: "utf8",
//           flags: "a",
//         }),
//       ],
//     ]);
//     this.loadDownloadCache();
//     this.loadIndexCache();
//   }

//   static async build(...args) {
//     const instance = new CacheService(...args);
//     await instance.setup();
//     return instance;
//   }

//   writeDownload(filename) {
//     this.streamMap.get("download").write(`${filename}\n`);
//     this.downloadCache.add(filename);
//   }

//   writeIndex(filename) {
//     this.streamMap.get("index").write(`${filename}\n`);
//   }

//   async loadDownloadCache() {
//     const body = await fs.readFile(this.downloadCachePath, "utf8");
//     console.log(body);
//     this.downloadCache = new Set([...this.downloadCache, ...body.split("\n")]);
//   }

//   downloadCached(filename) {
//     return this.downloadCache.has(filename);
//   }

//   async loadIndexCache() {
//     const body = await fs.readFile(this.indexCachePath, "utf8");
//     console.log(body);
//     this.indexCache = new Set([...this.indexCache, ...body.split("\n")]);
//   }

//   getIndexCache() {
//     return this.indexCache;
//   }
// }

// module.exports = CacheService;
