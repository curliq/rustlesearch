const fs = require("fs-extra");
const path = require("path");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);

const capitalise = string => string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();

class FileWriter {
  constructor(config) {
    this.config = config;
    this.streamMap = new Map();
  }

  getWriteStream(channel, day) {
    const filePath = path.join(
      this.config.fileWriter.directory,
      `${channel}::${day.format("YYYY-MM-DD")}.txt`,
    );
    if (this.streamMap.has(filePath)) {
      return this.streamMap.get(filePath);
    }
    this.streamMap.set(filePath, fs.createWriteStream(filePath, { flags: "a" }));
    return this.streamMap.get(filePath);
  }

  write({ channel, text, username }) {
    const day = dayjs().utc();
    const formattedDate = day.format("YYYY-MM-DD HH:mm:ss");
    this.getWriteStream(capitalise(channel), day).write(
      `[${formattedDate} UTC] ${username.toLowerCase()}: ${text}\n`,
    );
  }
}

module.exports = FileWriter;
