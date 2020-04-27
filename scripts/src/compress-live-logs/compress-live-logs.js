/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const zlib = require("zlib");
const fg = require("fast-glob");
const { parse, join } = require("path");
const os = require("os");
const { promisify } = require("util");
const { pipeline } = require("stream");
const fs = require("fs-extra");
const pMap = require("p-map");
const { Confirm } = require("enquirer");
const { dayjs } = require("../util");

const pipe = promisify(pipeline);

const buildCompressFile = (indexCacheStream, config) => async fname => {
  const { base } = parse(fname);
  const compressedPath = join(config.paths.orl, `${base}.gz`);
  const { name } = parse(fname);
  const tmpPath = join(os.tmpdir(), `${base}.gz`);

  if (!(await fs.pathExists(compressedPath))) {
    await pipe(
      fs.createReadStream(join(config.paths.orl, base), { encoding: "utf8" }),
      zlib.createGzip(),
      fs.createWriteStream(tmpPath),
    );
    await fs.move(tmpPath, compressedPath);
    indexCacheStream.write(`${name}\n`);
    console.log(`Processed ${name}`);
  } else {
    console.log(`Already exists ${name}`);
  }
};
const dateFromFname = fname => dayjs.utc(parse(fname).name.split("::")[1]);
module.exports = async config => {
  const rawFnames = await fg(join(config.paths.orl, "*.txt"));
  const today = dayjs()
    .utc()
    .startOf("day");
  const fnames = rawFnames.filter(
    fname => !dateFromFname(fname).isSameOrAfter(today),
  );

  const indexCacheStream = fs.createWriteStream(config.paths.indexCache, {
    flags: "a",
  });
  const compressFile = buildCompressFile(indexCacheStream, config);
  await pMap(fnames, compressFile, { concurrency: 5 });

  if (fnames.length > 1) {
    const answer = await new Confirm({
      name: "prompt",
      message: "Do you now want to delete the plain text logs?",
    }).run();
    if (answer) {
      await pMap(fnames, fname => fs.remove(fname), { concurrency: 5 });
    }
  }
};
