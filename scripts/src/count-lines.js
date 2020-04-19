const { promisify } = require("util");
const { join } = require("path");
const fs = require("fs-extra");
const zlib = require("zlib");
const { capitalise } = require("../util");
const config = require("./config");

const inflate = promisify(zlib.inflate);

module.exports = async (channel, day) => {
  const filepath = join(
    config.paths.orl,
    `${capitalise(channel)}::${day}.txt.zz`,
  );
  const fileExists = await fs.pathExists(filepath);
  if (!fileExists) {
    console.log("File does not exist");
    return;
  }
  const raw = await fs.readFile(filepath);
  const rawDecompressed = await inflate(raw);
  const decompressed = rawDecompressed.toString();
  // console.log(decompressed);
  console.log(decompressed.split("\n").length);
};
