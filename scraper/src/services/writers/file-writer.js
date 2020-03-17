const fs = require("fs-extra");
const { join } = require("path");

const { normalizeMessage } = require("../../util");

class FileWriter {
  constructor(config) {
    this.dir = config.fileWriter.directory;

    this.config = config;
    this.streamMap = new Map();
  }

  async setup() {
    console.log("dir", this.dir);
    await fs.ensureDir(this.dir);
  }

  static async build(...args) {
    const instance = new FileWriter(...args);
    await instance.setup();
    return instance;
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
    const { normMsg, day } = normalizeMessage(
      {
        channel,
        text,
        ts,
        username,
      },
      "YYYY-MM-DD HH:mm:ss",
    );
    this.getFileWriteStream(normMsg.channel, day).write(
      `[${normMsg.ts} UTC] ${normMsg.username}: ${normMsg.text}\n`,
    );
  }
}

module.exports = FileWriter;
