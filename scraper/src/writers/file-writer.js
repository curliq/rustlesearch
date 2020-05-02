const fs = require("fs-extra");
const NodeCache = require("node-cache");

const TransformService = require("../transform-service");
const buildOrlFs = require("../orl-fs");

class FileWriter {
  constructor(cfg) {
    this.dir = cfg.paths.orl;

    this.cfg = cfg;
    this.streamMap = new NodeCache({ stdTTL: 3600, useClones: false });
    this.orlFs = buildOrlFs({
      orl: cfg.paths.orl,
      channelsPath: cfg.paths.channels,
    });
  }

  async setup() {
    console.log("dir", this.dir);
    await fs.ensureDir(this.dir);
  }

  async getFileWriteStream(channel, day) {
    const path = this.orlFs.getPath({ channel, date: day.format("YYYY-MM-DD"), compressed: false });
    if (this.streamMap.has(path)) {
      return this.streamMap.get(path);
    }
    await fs.ensureFile(path);
    const writeStream = fs.createWriteStream(path, { flags: "a", encoding: "utf8" });
    this.streamMap.set(path, writeStream);
    return this.streamMap.get(path);
  }

  async write({ channel, text, ts, username }) {
    const msg = TransformService.toMessage({ channel, text, ts, username });
    const stream = await this.getFileWriteStream(msg.channel, msg.ts);
    stream.write(`${TransformService.msgToLine(msg)}\n`);
  }
}

module.exports = FileWriter;
