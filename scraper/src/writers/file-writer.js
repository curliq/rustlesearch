const fs = require("fs-extra");
const { join } = require("path");

const TransformService = require("../transform-service");

class FileWriter {
  constructor(cfg) {
    this.dir = cfg.paths.orl;

    this.cfg = cfg;
    this.streamMap = new Map();
  }

  async setup() {
    console.log("dir", this.dir);
    await fs.ensureDir(this.dir);
  }

  getFileWriteStream(channel, day) {
    const filepath = join(this.dir, `${channel}::${day.format("YYYY-MM-DD")}.txt`);
    if (this.streamMap.has(filepath)) {
      return this.streamMap.get(filepath);
    }
    const writeStream = fs.createWriteStream(filepath, { flags: "a", encoding: "utf8" });
    this.streamMap.set(filepath, writeStream);
    return this.streamMap.get(filepath);
  }

  write({ channel, text, ts, username }) {
    const msg = TransformService.toMessage({ channel, text, ts, username });
    this.getFileWriteStream(msg.channel, msg.ts).write(`${TransformService.msgToLine(msg)}\n`);
  }
}

module.exports = FileWriter;
