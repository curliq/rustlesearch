const fs = require("fs-extra");
const superagent = require("superagent");
const { join } = require("path");
const { createDeflate } = require("zlib");
const { finished, Readable } = require("stream");
const { promisify } = require("util");
const Bluebird = require("bluebird");
const { dayjs, capitalise, getDayRangeList } = require("../util");

const finishedAsync = promisify(finished);

class DownloadService {
  constructor(config, fileService, cacheService) {
    this.config = config.downloadService;
    this.fileService = fileService;
    this.cacheService = cacheService;
    this.monthsMap = new Map();
  }

  static async build(...args) {
    const instance = new DownloadService(...args);
    return instance;
  }

  async cachedGet(path, url) {
    const pathExists = await fs.pathExists(path);

    if (!pathExists) {
      try {
        const { text: res } = await superagent.get(url);
        await fs.outputFile(path, res);
      } catch (error) {
        return null;
      }
    }

    return fs.readFile(path);
  }

  async downloadLog(channel, day) {
    console.log("---------");
    const filepath = await this.fileService.getFilepathSmart(channel, day);
    console.log("Searched path: ", filepath);
    const { path, filename } = await this.fileService.getFilepathNaive(channel, day);
    console.log("Presumptive path: ", path);
    const isPossibleDate = day.isSameOrAfter(this.monthsMap.get(channel));
    console.log("Is a possible date: ", isPossibleDate);
    if (!filepath && !this.cacheService.downloadCached(filename) && isPossibleDate) {
      const timeStringComponent = day.format(`MMMM yyyy/yyyy-MM-dd`);
      try {
        const { text: res } = await superagent.get(
          `https://overrustlelogs.net/${channel} chatlog/${timeStringComponent}.txt`,
        );
        const s = new Readable();
        s.push(res);
        s.push(null);
        const writeStream = fs.createWriteStream(path);
        const encoder = createDeflate();
        await finishedAsync(s.pipe(encoder).pipe(writeStream));
        console.log(`Downloaded: ${filename}...`);
      } catch (e) {
        this.cacheService.writeDownload(filename);
        console.log(`Cached: ${filename}...`);
        /* handle error */
      }
    }
  }

  async downloadLogsDaysBack(daysBack) {
    const endDate = dayjs()
      .subtract(1, "d")
      .utc();
    const startDate = endDate.subtract(daysBack, "d");
    const dateRange = getDayRangeList(startDate, endDate);
    console.log(dateRange);
    console.log("Date range length:", dateRange.length);
    const channels = await this.fetchChannels();
    console.log("Channels count: ", channels);
    for (const day of dateRange) {
      Bluebird.map(
        channels,
        channel => {
          return this.downloadLog(channel, day);
        },
        { concurrency: 5 },
      );
    }
  }

  async fetchChannels() {
    const { body: baseChannels } = await superagent.get(
      "https://overrustlelogs.net/api/v1/channels.json",
    );
    return baseChannels.map(capitalise);
  }

  async getMonths() {
    const channels = await this.fetchChannels();
    const promises = channels.map(async channel => {
      const contents = await this.cachedGet(
        `${this.config.monthsPath}/${channel}.json`,
        `https://overrustlelogs.net/api/v1/${channel}/months.json`,
      );
      const parsed = JSON.parse(contents);
      const minDate = dayjs(parsed[parsed.length - 1]);
      this.monthsMap.set(channel, minDate);
    });
    Promise.all(promises);
  }
}

module.exports = DownloadService;
