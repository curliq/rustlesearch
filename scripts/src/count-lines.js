const { promisify } = require("util");
const { join } = require("path");
const fs = require("fs-extra");
const zlib = require("zlib");
const { capitalise, dayjs } = require("./util");

const gunzip = promisify(zlib.gunzip);

module.exports = async (config, channel, day) => {
  const filepath = join(
    config.paths.orl,
    `${capitalise(channel)}::${dayjs.utc(day).format("YYYY-MM-DD")}.txt.gz`,
  );
  const fileExists = await fs.pathExists(filepath);
  if (!fileExists) {
    console.log("File does not exist");
    return;
  }
  const raw = await fs.readFile(filepath);
  const rawDecompressed = await gunzip(raw);
  const decompressed = rawDecompressed.toString();
  console.log(decompressed.split("\n").length);
};
